const UIManager = {
    showFileList: (repo, owner, tree) => {
        return new Promise((resolve, reject) => {
            const list = document.getElementById("preview-container");
            list.innerHTML = "";
            tree
                .filter((item) => item.type === "blob")
                .filter(
                    (file) =>
                        file.path.endsWith(".html") ||
                        file.path.endsWith(".js") ||
                        file.path.endsWith(".css")
                )
                .forEach((file) => {
                    const link = document.createElement("a");
                    const fileLink = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
                    link.href = fileLink;
                    link.textContent = file.path;
                    link.target = "_blank";
                    link.className = "block hover:text-blue-600 underline";
                    list.appendChild(link);
                    ProjectManager.files.push({
                        file: file,
                        link: fileLink,
                        graphID: Wormhole.generateUUID(),
                    });
                });
            resolve();
        });
    },
    nextScreen: function (id) {
        document.querySelectorAll(".screen").forEach((screen) => {
            screen.classList.add("hidden");
        });
        document.getElementById(id).classList.remove("hidden");
    },
    deployProject: function () {
        document.getElementById("project-name").value = ProjectManager.projectName;
        UIManager.nextScreen("screen-deploy");
    }
};
