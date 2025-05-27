
var ScreenDeploying = {
    init: function () {
        var publishBtn = document.querySelector("#screen-deploy button");
        if (publishBtn) {
            publishBtn.addEventListener("click", function () {
                GraphPublisher.publish(userAddress, "deployed-files-container", "import-done-message", "continue-button");
            });
        }
    }
};