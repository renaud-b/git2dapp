var GraphPublisher = {
    dryRun: true,
    tasks: [],
    publish: function (
        userAddress,
        containerId,
        doneMessageId,
        continueButtonId,
        dryRun = true
    ) {
        this.tasks = [];
        this.dryRun = dryRun;
        return new Promise((resolve, reject) => {
            var projectName = document.getElementById("project-name").value.trim();
            ProjectManager.projectName = projectName;
            console.log("project to publish :", projectName)
            ProjectManager.getProjectFiles(userAddress, projectName)
                .then(function (projectFiles) {
                    if (projectFiles.length > 0) {
                        GraphPublisher._update(
                            containerId,
                            doneMessageId,
                            continueButtonId,
                            projectFiles,
                            userAddress
                        ).then(resolve);
                    } else {
                        GraphPublisher._create(
                            containerId,
                            doneMessageId,
                            continueButtonId,
                            userAddress
                        ).then(resolve);
                    }
                })
                .catch(function (err) {
                    console.error(err)
                });
        });
    },
    doesFileHasChange: function (existing, file) {
        return new Promise((resolve, reject) => {
            Blackhole.getGraph(existing.id).then(function (g) {
                const md5ExistingGraph = MD5(btoa(convertAccentsToHtmlCodes(JSON.stringify(g.object))));
                FileProcessor.extractGraph(existing.id, file.link, file.file.path, GraphPublisher.tasks.map(f => f.existing))
                    .then(function (b64Graph) {
                        const md5CurrentGraph = MD5(b64Graph);
                        if (md5CurrentGraph !== md5ExistingGraph) {
                            resolve({ hasChanged: true, b64Graph: b64Graph })
                        } else {
                            resolve({ hasChanged: false, b64Graph: b64Graph })
                        }
                    });
            });

        })
    },
    _update: function (
        containerId,
        doneMessageId,
        continueButtonId,
        projectFiles,
        userAddress
    ) {
        const $this = this;
        return new Promise((resolve, reject) => {
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
                var usedGraphID = existing ? existing.id : file.graphID;
                console.log(
                    "operation on file '" + file.file.path + "' => ",
                    existing ? "update" : "create",
                    " with graphID: ",
                    usedGraphID
                );
                var updatePromise = existing
                    ? GraphPublisher._updateFile(
                        usedGraphID,
                        file.link,
                        file.file.path,
                        existing,
                        projectFiles,
                        userAddress,
                        file
                    )
                    : GraphPublisher._publishFile(
                        usedGraphID,
                        file.link,
                        file.file.path,
                        userAddress
                    );
                $this.tasks.push({ file: file, existing: existing });
                updatePromise
                    .then(function (state) {
                        icon.className =
                            state === "AlreadyExists"
                                ? "fas fa-equals text-gray-400"
                                : "fas fa-check-circle text-green-600";
                        completed++;
                        if (completed === total) {
                            GraphPublisher._finalize(
                                ProjectManager.files,
                                userAddress,
                                doneMessage,
                                continueButton
                            ).then(resolve);
                        }
                    })
                    .catch(reject);
            });
        });
    },
    _create: function (
        containerId,
        doneMessageId,
        continueButtonId,
        userAddress
    ) {
        const $this = this;
        return new Promise((resolve, reject) => {
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
                $this.tasks.push({ file: file });
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
                        ).then(resolve);
                    }
                });
            });
        });
    },
    _finalize: function (filesSource, userAddress, doneMessage, continueButton) {
        const $this = this;
        return new Promise((resolve, reject) => {
            var projectFiles = $this.tasks.map(function (task) {
                const projectFile = task.file;
                if (task.existing !== undefined) {
                    projectFile.graphID = task.existing.id;
                }
                var name = projectFile.file ? projectFile.file.path : projectFile.name;
                var fileID = projectFile.graphID || projectFile.id;
                var type = null;
                if (name.endsWith(".html")) type = "text/html";
                else if (name.endsWith(".css")) type = "text/css";
                else if (name.endsWith(".js")) type = "text/javascript";
                return { name: name, type: type, id: fileID };
            });
            console.log("Finalizing project with files: ", projectFiles);
            var payload =
                "urn:pi:tesseract:projects:" +
                ProjectManager.projectName +
                ":files:" +
                btoa(JSON.stringify(projectFiles));
            GraphPublisher._writeTx(payload, userAddress)
                .then(function () {
                    doneMessage.classList.remove("hidden");
                    continueButton.classList.remove("hidden");
                    resolve();
                })
                .catch(reject);
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
                            console.log("update the file " + fileName);
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
        userAddress,
        file
    ) {
        const $this = this
        return new Promise(function (resolve, reject) {
            $this.doesFileHasChange(existing, file).then((response) => {
                const hasChanged = response.hasChanged
                const b64Graph = response.b64Graph
                if (!hasChanged) {
                    resolve("AlreadyExists")
                    return
                }
                var payload =
                    "urn:pi:graph:snap:" + existing.id + ":data:" + b64Graph;
                console.log("update the file " + fileName);
                GraphPublisher._writeTx(payload, userAddress)
                    .then(resolve)
                    .catch(reject);
            })

        });
    },
    _writeTx: function (payload, userAddress) {
        if (this.dryRun) {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
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
