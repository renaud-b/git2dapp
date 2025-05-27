
var ScreenWelcome = {
    init: function () {
        var continueBtn = document.querySelector("#screen-welcome button");
        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                var input = document.getElementById("github-url").value;
                GitHubFetcher.fetch(input);
            });
        }
    }
};
