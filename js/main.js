let userAddress = undefined;
let eventManager = new EventManager((data) => {
    userAddress = data.address;
    const repoURL = localStorage.getItem("repoURL");
    if (repoURL) {
        document.getElementById("github-url").value = repoURL;
    }
});

function fetchCode() {
    const input = document.getElementById("github-url").value.trim();
    ProjectManager.fetchRepo(input).then((response) => {
        localStorage.setItem("repoURL", input);
        const owner = response.owner;
        const repo = response.repo;
        const data = response.data;
        if (!data.tree) {
            list.innerHTML = '<p class="text-red-500">Erreur ou branche introuvable.</p>';
            return;
        }
        UIManager.showFileList(repo, owner, data.tree).then(() => {
            UIManager.nextScreen("screen-preview");
        });
    }).catch((e) => {
        console.log(e);
        console.error("Erreur lors de la récupération du dépôt.");
    });
}

function deployProject() {
    document.getElementById("project-name").value = ProjectManager.projectName;
    UIManager.nextScreen("screen-deploy");
}

function upgradeGraphConnections(graphID, rawGraph, existingFiles = []) {
    const g = JSON.parse(atob(rawGraph));
    const root = new GraphElement(graphID, g);
    const scriptNodes = [];
    root.traverse((node) => {
        if (node.object.tag === "script") {
            const targetFile = ProjectManager.getFile(node.object["html-src"]);
            const existing = existingFiles.find((pf) => (pf.name === node.object["html-src"]));
            if (existing !== undefined) {
                node.object["html-src"] = ("/parser/graph/javascript/" + existing.id);
                scriptNodes.push(node);
                return;
            }
            if (targetFile != null) {
                node.object["html-src"] = ("/parser/graph/javascript/" + targetFile.graphID);
                scriptNodes.push(node);
            }
        }
    });
    return toBase64UTF8(JSON.stringify(root.object));
}

function updateFile(graphID, fileLink, fileName, existing, existingFiles) {
    return new Promise((resolve, reject) => {
        extractGraph(graphID, fileLink, fileName, existingFiles).then((b64Graph) => {
            Blackhole.getGraph(existing.id).then((g) => {
                const md5ExistingGraph = MD5(toBase64UTF8(JSON.stringify(g.object)));
                const md5CurrentGraph = MD5(b64Graph);
                if (md5CurrentGraph !== md5ExistingGraph) {
                    console.log("graph is different: ", fileName);
                    const payload = ((("urn:pi:graph:snap:" + existing.id) + ":data:") + b64Graph);
                    writeTx(payload).then(() => {
                        resolve();
                    }).catch(reject);
                } else {
                    resolve("AlreadyExists");
                }
            });
        }).catch(reject);
    });
}

function publishFile(graphID, fileLink, fileName) {
    return new Promise((resolve, reject) => {
        extractGraph(graphID, fileLink, fileName).then((b64Graph) => {
            const payload = Blackhole.Actions.makeCreateGraph(graphID);
            writeTx(payload).then(() => {
                const payload = ((("urn:pi:graph:snap:" + graphID) + ":data:") + b64Graph);
                writeTx(payload).then(() => {
                    resolve();
                }).catch(reject);
            }).catch(reject);
        }).catch(reject);
    });
}

function writeTx(payload) {
    return new Promise((resolve, reject) => {
        const event = {'type': "sign", 'recipient_blockchain_address': userAddress, 'data': payload, 'value': 0};
        if (eventManager) {
            eventManager.send(event, (payload) => {
                Singularity.saveSignedTx(payload).then((tx) => {
                    Singularity.waitForTransaction(tx.UUID, () => {
                        resolve();
                    });
                }).catch(reject);
            }, reject);
        }
    });
}

function extractGraph(graphID, fileLink, fileName, existingFiles = []) {
    return new Promise((resolve, reject) => {
        fetch(fileLink).then((res) => res.text()).then((data) => {
            console.log("data : ", data)
            if (fileName.endsWith(".html")) {
                Wormhole.HTMLToGraph(data).then((graph) => {
                    resolve(upgradeGraphConnections(graphID, graph, existingFiles));
                }).catch(reject);
            } else if (fileName.endsWith(".js")) {
                Wormhole.javascriptToGraph(data).then((graph) => {
                    resolve(graph);
                }).catch(reject);
            } else if (fileName.endsWith(".css")) {
                Wormhole.CSSToGraph(data).then((graph) => {
                    resolve(graph);
                }).catch(reject);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

function publish() {
    ProjectManager.projectName = document.getElementById("project-name").value.trim();
    ProjectManager.getProjectFiles(userAddress, ProjectManager.projectName).then((projectFiles) => {
        try {
            const container = document.getElementById("deployed-files-container");
            const doneMessage = document.getElementById("import-done-message");
            processProjectUpdate(container, doneMessage, projectFiles);
        } catch (e) {
            console.error(e);
        }
    }).catch((e) => {
        console.log("no project found");
        const container = document.getElementById("deployed-files-container");
        const doneMessage = document.getElementById("import-done-message");
        processProjectCreation(container, doneMessage);
    });
}

function processProjectUpdate(container, doneMessage, projectFiles) {
    container.innerHTML = "";
    doneMessage.classList.add("hidden");
    let completed = 0;
    const total = ProjectManager.files.length;
    const continueButton = document.getElementById("continue-button");
    ProjectManager.files.forEach((file, index) => {
        const row = document.createElement("div");
        row.className = "flex items-center gap-4";
        const icon = document.createElement("i");
        icon.className = "fas fa-spinner fa-spin text-blue-500";
        const existing = projectFiles.find((pf) => (pf.name === file.file.path));
        const fileName = document.createElement("span");
        if (existing) {
            fileName.textContent = (((file.file.path + "(") + existing.id) + ")");
        } else {
            fileName.textContent = (((file.file.path + "(") + file.graphID) + ")");
        }
        row.appendChild(icon);
        row.appendChild(fileName);
        container.appendChild(row);
        console.log("existing: ", existing);
        updateFile(file.graphID, file.link, file.file.path, existing, projectFiles).then((state) => {
            if (state === "AlreadyExists") {
                icon.className = "fas fa-equals text-gray-400";
            } else {
                icon.className = "fas fa-check-circle text-green-600";
            }
            completed++;
            if (completed === total) {
                const tesseractProjectFiles = [];
                for (let i = 0; (i < ProjectManager.files.length); i++) {
                    const projectFile = ProjectManager.files[i];
                    const existingFile = projectFiles.find((pf) => (pf.name === projectFile.file.path));
                    console.log("already existing file: ", existingFile);
                    const fileData = {'name': projectFile.file.path, 'type': undefined, 'id': existingFile.id};
                    if (projectFile.file.path.endsWith(".html")) {
                        fileData.type = "text/html";
                    } else if (projectFile.file.path.endsWith(".css")) {
                        fileData.type = "text/css";
                    } else if (projectFile.file.path.endsWith(".js")) {
                        fileData.type = "text/javascript";
                    }
                    tesseractProjectFiles.push(fileData);
                }
                const payload = ((("urn:pi:tesseract:projects:" + ProjectManager.projectName) + ":files:") + btoa(JSON.stringify(tesseractProjectFiles)));
                writeTx(payload).then(() => {
                    doneMessage.classList.remove("hidden");
                    continueButton.classList.remove("hidden");
                });
            }
        });
    });
    continueButton.classList.add("hidden");
    UIManager.nextScreen("screen-deploy-pending");
}

function processProjectCreation(container, doneMessage) {
    container.innerHTML = "";
    doneMessage.classList.add("hidden");
    let completed = 0;
    const total = ProjectManager.files.length;
    const continueButton = document.getElementById("continue-button");
    ProjectManager.files.forEach((file, index) => {
        const row = document.createElement("div");
        row.className = "flex items-center gap-4";
        const icon = document.createElement("i");
        icon.className = "fas fa-spinner fa-spin text-blue-500";
        const fileName = document.createElement("span");
        fileName.textContent = file.file.path;
        row.appendChild(icon);
        row.appendChild(fileName);
        container.appendChild(row);
        publishFile(file.graphID, file.link, file.file.path).then(() => {
            icon.className = "fas fa-check-circle text-green-600";
            completed++;
            if (completed === total) {
                const projectFiles = [];
                for (let i = 0; (i < ProjectManager.files.length); i++) {
                    const projectFile = ProjectManager.files[i];
                    console.log(projectFile);
                    const fileData = {'name': projectFile.file.path, 'type': undefined, 'id': projectFile.graphID};
                    if (projectFile.file.path.endsWith(".html")) {
                        fileData.type = "text/html";
                    } else if (projectFile.file.path.endsWith(".css")) {
                        fileData.type = "text/css";
                    } else if (projectFile.file.path.endsWith(".js")) {
                        fileData.type = "text/javascript";
                    }
                    projectFiles.push(fileData);
                }
                const payload = ((("urn:pi:tesseract:projects:" + ProjectManager.projectName) + ":files:") + btoa(JSON.stringify(projectFiles)));
                writeTx(payload).then(() => {
                    doneMessage.classList.remove("hidden");
                    continueButton.classList.remove("hidden");
                });
            }
        });
    });
    continueButton.classList.add("hidden");
    UIManager.nextScreen("screen-deploy-pending");
}