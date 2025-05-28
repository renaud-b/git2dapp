var ScreenDeployPending = {
    init: function (userAddress) {
        const continueBtn = document.getElementById("continue-button");
        this._bind(continueBtn);
        continueBtn.style.display = "none";
        GraphPublisher.publish(
            userAddress,
            "deployed-files-container",
            "import-done-message",
            "continue-button",
            false
        ).then(() => {
            continueBtn.style.display = "block";
        });
    },
    _bind: function (continueBtn) {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                UIManager.nextScreen("screen-success");
            });
        }
    },
};
