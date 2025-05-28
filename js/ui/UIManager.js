const UIManager = {
    showFileList: (repo, owner, tree) => {
        return new Promise((resolve, reject) => {
            const list = document.getElementById("preview-container");
            list.innerHTML = "";
            const header = document.createElement("tr");
            header.innerHTML = `
          <th class="text-left px-2 py-1">File</th>
          <th class="text-left px-2 py-1">Action</th>
          <th class="text-left px-2 py-1">Link</th>
      `;
            list.appendChild(header);

            tree
                .filter((item) => item.type === "blob")
                .filter(
                    (file) =>
                        file.path.endsWith(".html") ||
                        file.path.endsWith(".js") ||
                        file.path.endsWith(".css")
                )
                .forEach((file) => {
                    const fileID = MD5(file.path);
                    const line = document.createElement("tr");

                    // Nom du fichier
                    const fileNameCell = document.createElement("td");
                    fileNameCell.className = "px-2 py-1";
                    fileNameCell.textContent = file.path;
                    line.appendChild(fileNameCell);

                    // Badge vide (rempli plus tard par GraphPublisher)
                    const badgeCell = document.createElement("td");
                    badgeCell.className = "px-2 py-1";
                    badgeCell.id = fileID;
                    line.appendChild(badgeCell);

                    // Lien GitHub
                    const linkCell = document.createElement("td");
                    linkCell.className = "px-2 py-1";
                    const link = document.createElement("a");
                    const fileLink = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
                    link.href = fileLink;
                    link.target = "_blank";
                    link.textContent = "View";
                    link.className = "text-blue-600 hover:underline";
                    linkCell.appendChild(link);
                    line.appendChild(linkCell);

                    list.appendChild(line);

                    ProjectManager.files.push({
                        'file': file,
                        'id': fileID,
                        'link': fileLink
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
        var s = StateManager.screens[id];
        if (s && typeof s.init === "function") {
            s.init(StateManager.userAddress);
        }
    },
    deployProject: function () {
        document.getElementById("project-name").value = ProjectManager.projectName;
        UIManager.nextScreen("screen-deploy");
    },
};
