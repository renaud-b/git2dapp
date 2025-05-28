var ScreenDeployPending = {
    'init': function () {
        document.getElementById("continue-button").style.display = "block";
        this._bind();
    }, '_bind': function () {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        var continueBtn = document.querySelector("#continue-button");
        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                UIManager.nextScreen("screen-success");
            });
        }
    }
};