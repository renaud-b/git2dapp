var StateManager = {
    'userAddress': undefined, 'init': function () {
        var repoURL = localStorage.getItem("repoURL");
        if (repoURL) {
            document.getElementById("github-url").value = repoURL;
        }
        this.screens = {
            "screen-welcome": ScreenWelcome,
            "screen-preview": ScreenPreview,
            "screen-deploy": ScreenDeploying,
            "screen-success": ScreenSuccess,
            "screen-deploy-pending": ScreenDeployPending
        };
    }, 'setUserAddress': function (address) {
        this.userAddress = address;
    }, 'reset': function () {
        ProjectManager.files = [];
        ProjectManager.projectName = undefined;
        ProjectManager.updates = [];
        this.userAddress = undefined;
        localStorage.removeItem("repoURL");
    }
};