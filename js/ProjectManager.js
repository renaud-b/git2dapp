const ProjectManager = {
    projectName: undefined,
    files: [],
    getFile: function (fileName) {
        for (let i = 0; i < this.files.length; ++i) {
            if (this.files[i].file.path === fileName) {
                return this.files[i];
            }
        }
        return null;
    },
    fetchRepo: function (input) {
        return new Promise((resolve, reject) => {
            const match = input.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
            if (!match) {
                alert("URL invalide");
                return;
            }
            const [_, owner, repo] = match;
            const apiURL = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
            fetch(apiURL)
                .then((res) => res.json())
                .then((data) => {
                    ProjectManager.projectName = repo;
                    resolve({ owner: owner, repo: repo, data: data });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    getProjects: (address) => {
        const filter = JSON.stringify({
            type: "and",
            children: [
                {
                    type: "equals",
                    field: "recipient_blockchain_address",
                    value: address,
                },
                {
                    type: "has_prefix",
                    field: "data",
                    value: "urn:pi:tesseract:projects:",
                },
            ],
        });
        return new Promise((resolve, reject) => {
            Singularity.filterTxAsync(filter)
                .then((txList) => {
                    if (txList.length == 0) {
                        resolve([]);
                        return;
                    }
                    const projects = {};
                    for (let i = 0; i < txList.length; i++) {
                        const parts = txList[i].data.replace(
                            "urn:pi:tesseract:projects:",
                            ""
                        );
                        const projectName = parts.split(":")[0];
                        const rawProjectFiles = parts.split(":")[2];
                        try {
                            projects[projectName] = JSON.parse(atob(rawProjectFiles));
                        } catch (e) {
                            console.error(
                                "Error parsing project files : '" + rawProjectFiles + "'",
                                e
                            );
                        }
                    }
                    resolve(projects);
                })
                .catch(reject);
        });
    },
    getProjectFiles: (address, projectName) => {
        const filter = JSON.stringify({
            type: "and",
            children: [
                {
                    type: "equals",
                    field: "recipient_blockchain_address",
                    value: address,
                },
                {
                    type: "has_prefix",
                    field: "data",
                    value: "urn:pi:tesseract:projects:" + projectName + ":files:",
                },
            ],
        });
        return new Promise((resolve, reject) => {
            Singularity.filterTxAsync(filter)
                .then((txList) => {
                    let files = [];
                    if (txList.length === 0) {
                        reject(
                            "No file found for project " + projectName + " of user " + address
                        );
                        return;
                    }
                    const lastTx = txList.at(-1);
                    const parts = lastTx.data.replace("urn:pi:tesseract:projects:", "");
                    const rawProjectFiles = parts.split(":")[2];
                    try {
                        files = JSON.parse(atob(rawProjectFiles));
                    } catch (e) {
                        console.error("Error parsing project files", e);
                    }
                    resolve(files);
                })
                .catch(reject);
        });
    },
};
