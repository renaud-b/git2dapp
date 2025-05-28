const UIManager = {
    'showFileList': (repo, owner, tree) => {
        return new Promise((resolve, reject) => {
            const list = document.getElementById("preview-container");
            list.innerHTML = "";
            tree.filter((item) => (item.type === "blob")).filter((file) => ((file.path.endsWith(".html") || file.path.endsWith(".js")) || file.path.endsWith(".css"))).forEach((file) => {
                const fileID = MD5(file.path);
                const line = document.createElement("tr");
                const fileNameCell = document.createElement("td");
                line.appendChild(fileNameCell);
                const link = document.createElement("a");
                const fileLink = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
                link.href = fileLink;
                link.textContent = file.path;
                link.target = "_blank";
                link.className = "block hover:text-blue-600 underline";
                line.appendChild(link);
                const operationCell = document.createElement("td");
                operationCell.id = fileID;
                line.appendChild(operationCell);
                list.appendChild(line);
                ProjectManager.files.push({'file': file, 'id': fileID, 'link': fileLink});
            });
            resolve();
        });
    }, 'nextScreen': function (id) {
        document.querySelectorAll(".screen").forEach((screen) => {
            screen.classList.add("hidden");
        });
        document.getElementById(id).classList.remove("hidden");
        var s = StateManager.screens[id];
        if (s && (typeof s.init === "function")) {
            s.init(StateManager.userAddress);
        }
    }, 'deployProject': function () {
        document.getElementById("project-name").value = ProjectManager.projectName;
        UIManager.nextScreen("screen-deploy");
    }
};