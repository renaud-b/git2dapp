var GitHubFetcher = {
    fetch: function (input, callback) {
        input = input.trim();
        ProjectManager.fetchRepo(input).then(function (response) {
            localStorage.setItem("repoURL", input);
            var owner = response.owner;
            var repo = response.repo;
            var data = response.data;

            if (!data.tree) {
                var list = document.getElementById("preview-container");
                list.innerHTML = '<p class="text-red-500">Erreur ou branche introuvable.</p>';
                return;
            }

            UIManager.showFileList(repo, owner, data.tree).then(function () {
                UIManager.nextScreen("screen-preview");
                if (callback) callback(null, response);
            });

        }).catch(function (e) {
            console.log(e);
            console.error("Erreur lors de la récupération du dépôt.");
            if (callback) callback(e);
        });
    }
};