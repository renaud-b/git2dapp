
var StateManager = {
    userAddress: undefined,

    init: function () {
        // Récupère l'URL sauvegardée
        var repoURL = localStorage.getItem("repoURL");
        if (repoURL) {
            document.getElementById("github-url").value = repoURL;
        }

        // Initialise tous les écrans disponibles
        var screens = [
            ScreenWelcome,
            ScreenPreview,
            ScreenDeploying,
            ScreenSuccess,
        ];

        for (var i = 0; i < screens.length; i++) {
            var s = screens[i];
            if (s && typeof s.init === "function") {
                s.init();
            }
        }
    },

    setUserAddress: function (address) {
        this.userAddress = address;
    },

    reset: function () {
        ProjectManager.files = [];
        ProjectManager.projectName = undefined;
        this.userAddress = undefined;
        localStorage.removeItem("repoURL");
    }
};