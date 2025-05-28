var ScreenPreview = {
    'init': function (userAddress) {
        GraphPublisher.publish(userAddress, "deployed-files-container", "import-done-message", "continue-button", true).then(() => {
            console.log("tasks: ", GraphPublisher.tasks);
            GraphPublisher.tasks.forEach((t) => {
                console.log("- task: ", t);
                const targetStatusCell = document.getElementById(t.file.id);
                const badge = document.createElement("div");
                badge.classList.add("badge", "badge-primary");
                if (t.existing !== undefined) {
                    badge.innerText = "update";
                } else {
                    badge.innerText = "create";
                }
                targetStatusCell.appendChild(badge);
            });
        });
        this._bind(userAddress);
    }, '_bind': function (userAddress) {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        console.log("start to init screen preview");
        var deployBtn = document.querySelector("#screen-preview button");
        if (deployBtn) {
            deployBtn.addEventListener("click", function () {
                GraphPublisher.publish(userAddress, "deployed-files-container", "import-done-message", "continue-button", true).then(() => {
                    UIManager.nextScreen("screen-deploy-pending");
                });
            });
        }
    }
};