
var userAddress = undefined;

var eventManager = new EventManager(function (data) {
    userAddress = data.address;
    ScreenWelcome.init();
    ScreenDeploying.init();

    var repoURL = localStorage.getItem("repoURL");
    if (repoURL) {
        document.getElementById("github-url").value = repoURL;
    }
});

// Liaison des boutons
function fetchCode() {
    var input = document.getElementById("github-url").value;
    GitHubFetcher.fetch(input);
}

function deployProject() {
    UIManager.deployProject();
}

function publish() {
    GraphPublisher.publish(userAddress, "deployed-files-container", "import-done-message", "continue-button");
}
