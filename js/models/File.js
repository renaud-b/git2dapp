class File {
    constructor(fileName, link) {
        this.fileName = fileName;
        this.link = link;
        if (this.fileName.endsWith(".html")) {
            this.mimeType = "text/html";
        } else if (this.fileName.endsWith(".css")) {
            this.mimeType = "text/css";
        } else if (this.fileName.endsWith(".js")) {
            this.mimeType = "text/javascript";
        }
        this.graphID = Wormhole.generateUUID();
    }

    setGraphID(graphID) {
        this.graphID = graphID;
    }
}