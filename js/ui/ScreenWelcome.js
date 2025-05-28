var ScreenWelcome = {
    init: function () {
        this._bind();
    },
    _bind: function () {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        var continueBtn = document.querySelector("#screen-welcome-btn");
        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                var input = document.getElementById("github-url").value;
                GitHubFetcher.fetch(input).then(() => {
                    document.getElementById("project-name").value =
                        ProjectManager.projectName;
                    UIManager.nextScreen("screen-deploy");
                });
            });
        }
    },
};
