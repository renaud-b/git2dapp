var ScreenWelcome = {
    init: function () {
        console.log("init ScreenWelcome")
        var continueBtn = document.querySelector("#screen-welcome-btn");
        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                var input = document.getElementById("github-url").value;
                console.log("continue button")
                GitHubFetcher.fetch(input);
            });
        }
    },
};
