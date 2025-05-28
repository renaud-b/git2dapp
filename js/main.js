var eventManager = new EventManager((data) => {
    console.log("event manager is starting");
    StateManager.setUserAddress(data.address);
    StateManager.init();
    UIManager.nextScreen("screen-welcome");
});