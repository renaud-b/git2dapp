var ScreenDeploying = {
    init: function () {
        this._bind();
    },
    _bind: function () {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        var publishBtn = document.querySelector("#screen-deploy button");
        if (publishBtn) {
            publishBtn.addEventListener("click", function () {
                UIManager.nextScreen("screen-preview");
            });
        }
    },
};
