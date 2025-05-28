var ScreenDeploying = {
    'init': function () {
        console.log("init deploying screen");
        this._bind();
    }, '_bind': function () {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        console.log("start to init screen deploying");
        var publishBtn = document.querySelector("#screen-deploy button");
        if (publishBtn) {
            publishBtn.addEventListener("click", function () {
                UIManager.nextScreen("screen-preview");
            });
        }
    }
};