
var StateManager = {
    userAddress: undefined,

    init: function () {
        // Récupère l'URL sauvegardée
        var repoURL = localStorage.getItem("repoURL");
        if (repoURL) {
            document.getElementById("github-url").value = repoURL;
        }

        // Initialisation des écrans
        if (ScreenWelcome && ScreenWelcome.init) ScreenWelcome.init();
        if (ScreenDeploying && ScreenDeploying.init) ScreenDeploying.init();
    },

    setUserAddress: function (address) {
        this.userAddress = address;
    },

    getUserAddress: function () {
        return this.userAddress;
    },

    saveRepoURL: function (url) {
        localStorage.setItem("repoURL", url);
    },

    reset: function () {
        ProjectManager.files = [];
        ProjectManager.projectName = undefined;
        this.userAddress = undefined;
        localStorage.removeItem("repoURL");
    }
};