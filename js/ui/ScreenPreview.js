
var ScreenPreview = {
    init: function () {
        var deployBtn = document.querySelector("#screen-preview button");
        if (deployBtn) {
            deployBtn.addEventListener("click", function () {
                UIManager.deployProject();
            });
        }
    }
};