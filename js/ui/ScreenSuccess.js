var ScreenSuccess = {
    init: function () {
        this._bind();
    },
    _bind: function () {
        var screen = document.getElementById("screen-success");
        if (!screen) return;
        var finishBtn = screen.querySelector("button");
        if (finishBtn) {
            finishBtn.addEventListener("click", function () {
                StateManager.reset();
                UIManager.nextScreen("screen-welcome");
            });
        }
    },
};
