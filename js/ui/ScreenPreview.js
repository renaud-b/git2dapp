var ScreenPreview = {
    init: function (userAddress) {
        GraphPublisher.publish(
            userAddress,
            "deployed-files-container",
            "import-done-message",
            "continue-button",
            true
        ).then(() => {
            GraphPublisher.tasks.forEach((t) => {
                const targetStatusCell = document.getElementById(t.file.id);
                const badge = document.createElement("span");
                badge.className =
                    "inline-block px-2 py-0.5 text-xs font-semibold rounded-full";
                if (t.existing !== undefined) {
                    badge.textContent = "skip";
                    badge.className +=
                        " bg-green-100 text-green-800 border border-green-300";
                    GraphPublisher.doesFileHasChange(t.existing, t.file).then(
                        (response) => {
                            if (response.hasChanged) {
                                badge.textContent = "update";
                                badge.className +=
                                    " bg-yellow-100 text-yellow-800 border border-yellow-300";
                            }
                        }
                    );
                } else {
                    badge.textContent = "create";
                    badge.className +=
                        " bg-green-100 text-green-800 border border-green-300";
                }
                targetStatusCell.appendChild(badge);
            });
        });
        this._bind(userAddress);
    },
    _bind: function (userAddress) {
        if (this.hasAlreadyBind === true) {
            return;
        }
        this.hasAlreadyBind = true;
        var deployBtn = document.querySelector("#screen-preview button");
        if (deployBtn) {
            deployBtn.addEventListener("click", function () {
                UIManager.nextScreen("screen-deploy-pending");
            });
        }
    },
};
