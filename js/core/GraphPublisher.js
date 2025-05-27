var GraphPublisher = {
    publish: function (
        userAddress,
        containerId,
        doneMessageId,
        continueButtonId
    ) {
        var projectName = document.getElementById("project-name").value.trim();
        ProjectManager.projectName = projectName;
        ProjectManager.getProjectFiles(userAddress, projectName)
            .then(function (projectFiles) {
                GraphPublisher._update(
                    containerId,
                    doneMessageId,
                    continueButtonId,
                    projectFiles,
                    userAddress
                );
            })
            .catch(function () {
                GraphPublisher._create(
                    containerId,
                    doneMessageId,
                    continueButtonId,
                    userAddress
                );
            });
    },
    _update: function (
        containerId,
        doneMessageId,
        continueButtonId,
        projectFiles,
        userAddress
    ) {
        var container = document.getElementById(containerId);
        var doneMessage = document.getElementById(doneMessageId);
        var continueButton = document.getElementById(continueButtonId);
        container.innerHTML = "";
        doneMessage.classList.add("hidden");
        continueButton.classList.add("hidden");
        var completed = 0;
        var total = ProjectManager.files.length;
        ProjectManager.files.forEach(function (file) {
            var row = document.createElement("div");
            row.className = "flex items-center gap-4";
            var icon = document.createElement("i");
            icon.className = "fas fa-spinner fa-spin text-blue-500";
            var fileName = document.createElement("span");
            var existing = projectFiles.find(function (pf) {
                return pf.name === file.file.path;
            });
            fileName.textContent =
                file.file.path +
                (existing ? " (" + existing.id + ")" : " (" + file.graphID + ")");
            row.appendChild(icon);
            row.appendChild(fileName);
            container.appendChild(row);
            console.log("existing:", existing)
            console.log("start to update file: ", file.file.path)

            if (!existing) {
                GraphPublisher._publishFile(file.graphID, file.link, file.file.path, userAddress).then(function () {
                    icon.className = "fas fa-check-circle text-green-600";
                    completed++;
                    if (completed === total) {
                        GraphPublisher._finalize(ProjectManager.files, userAddress, doneMessage, continueButton);
                    }
                });
            } else {
                var usedGraphID = existing ? existing.id : file.graphID;

                GraphPublisher._updateFile(usedGraphID, file.link, file.file.path, existing, projectFiles, userAddress).then(function (state) {
                    icon.className = (state === "AlreadyExists") ? "fas fa-equals text-gray-400" : "fas fa-check-circle text-green-600";
                    completed++;
                    if (completed === total) {
                        GraphPublisher._finalize(ProjectManager.files, userAddress, doneMessage, continueButton);
                    }
                });
            }
        });
        UIManager.nextScreen("screen-deploy-pending");
    },
    _create: function (
        containerId,
        doneMessageId,
        continueButtonId,
        userAddress
    ) {
        var container = document.getElementById(containerId);
        var doneMessage = document.getElementById(doneMessageId);
        var continueButton = document.getElementById(continueButtonId);
        container.innerHTML = "";
        doneMessage.classList.add("hidden");
        continueButton.classList.add("hidden");
        var completed = 0;
        var total = ProjectManager.files.length;
        ProjectManager.files.forEach(function (file) {
            var row = document.createElement("div");
            row.className = "flex items-center gap-4";
            var icon = document.createElement("i");
            icon.className = "fas fa-spinner fa-spin text-blue-500";
            var fileName = document.createElement("span");
            fileName.textContent = file.file.path;
            row.appendChild(icon);
            row.appendChild(fileName);
            container.appendChild(row);
            GraphPublisher._publishFile(
                file.graphID,
                file.link,
                file.file.path,
                userAddress
            ).then(function () {
                icon.className = "fas fa-check-circle text-green-600";
                completed++;
                if (completed === total) {
                    GraphPublisher._finalize(
                        ProjectManager.files,
                        userAddress,
                        doneMessage,
                        continueButton
                    );
                }
            });
        });
        UIManager.nextScreen("screen-deploy-pending");
    },
    _finalize: function (filesSource, userAddress, doneMessage, continueButton) {
        var projectFiles = filesSource.map(function (projectFile) {
            var name = projectFile.file.path;
            var fileID = projectFile.graphID;
            var type = null;
            if (name.endsWith(".html")) type = "text/html";
            else if (name.endsWith(".css")) type = "text/css";
            else if (name.endsWith(".js")) type = "text/javascript";
            return {
                name: name,
                type: type,
                id: fileID
            };
        });

        var payload = "urn:pi:tesseract:projects:" + ProjectManager.projectName + ":files:" + btoa(JSON.stringify(projectFiles));
        GraphPublisher._writeTx(payload, userAddress).then(function () {
            doneMessage.classList.remove("hidden");
            continueButton.classList.remove("hidden");
        });
    },
    _publishFile: function (graphID, fileLink, fileName, userAddress) {
        return new Promise(function (resolve, reject) {
            FileProcessor.extractGraph(graphID, fileLink, fileName)
                .then(function (b64Graph) {
                    var payload = Blackhole.Actions.makeCreateGraph(graphID);
                    GraphPublisher._writeTx(payload, userAddress)
                        .then(function () {
                            var payload =
                                "urn:pi:graph:snap:" + graphID + ":data:" + b64Graph;
                            GraphPublisher._writeTx(payload, userAddress)
                                .then(resolve)
                                .catch(reject);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    },
    _updateFile: function (
        graphID,
        fileLink,
        fileName,
        existing,
        existingFiles,
        userAddress
    ) {
        return new Promise(function (resolve, reject) {
            FileProcessor.extractGraph(graphID, fileLink, fileName, existingFiles)
                .then(function (b64Graph) {
                    Blackhole.getGraph(existing.id).then(function (g) {
                        var md5ExistingGraph = MD5(toBase64UTF8(JSON.stringify(g.object)));
                        var md5CurrentGraph = MD5(b64Graph);
                        if (md5CurrentGraph !== md5ExistingGraph) {
                            var payload =
                                "urn:pi:graph:snap:" + existing.id + ":data:" + b64Graph;
                            GraphPublisher._writeTx(payload, userAddress)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            resolve("AlreadyExists");
                        }
                    });
                })
                .catch(reject);
        });
    },
    _writeTx: function (payload, userAddress) {
        return new Promise(function (resolve, reject) {
            var event = {
                type: "sign",
                recipient_blockchain_address: userAddress,
                data: payload,
                value: 0,
            };
            if (eventManager) {
                eventManager.send(
                    event,
                    function (payload) {
                        Singularity.saveSignedTx(payload)
                            .then(function (tx) {
                                Singularity.waitForTransaction(tx.UUID, resolve);
                            })
                            .catch(reject);
                    },
                    reject
                );
            }
        });
    },
};
