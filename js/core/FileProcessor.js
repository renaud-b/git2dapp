// core/FileProcessor.js

var FileProcessor = {
    extractGraph: function (graphID, fileLink, fileName, existingFiles) {
        return new Promise(function (resolve, reject) {
            fetch(fileLink).then(function (res) {
                return res.text();
            }).then(function (data) {
                console.log("processing file : ", fileName);
                if (fileName.endsWith(".html")) {
                    Wormhole.HTMLToGraph(data).then(function (graph) {
                        console.log("HTML graph generated");
                        var upgraded = FileProcessor.upgradeGraphConnections(graphID, graph, existingFiles || []);
                        resolve(upgraded);
                    }).catch(reject);
                } else if (fileName.endsWith(".js")) {
                    Wormhole.javascriptToGraph(data).then(function (graph) {
                        resolve(graph);
                    }).catch(reject);
                } else if (fileName.endsWith(".css")) {
                    Wormhole.CSSToGraph(data).then(function (graph) {
                        resolve(graph);
                    }).catch(reject);
                } else {
                    reject("Type de fichier non supporté : " + fileName);
                }
            }).catch(reject);
        });
    },

    upgradeGraphConnections: function (graphID, rawGraph, existingFiles) {
        var g = JSON.parse(atob(rawGraph));
        var root = new GraphElement(graphID, g);
        var scriptNodes = [];

        root.traverse(function (node) {
            if (node.object.tag === "script") {
                var src = node.object["html-src"];
                var targetFile = ProjectManager.getFile(src);
                var existing = (existingFiles || []).find(function (pf) {
                    return pf.name === src;
                });

                if (existing) {
                    node.object["html-src"] = "/parser/graph/javascript/" + existing.id;
                } else if (targetFile != null) {
                    node.object["html-src"] = "/parser/graph/javascript/" + targetFile.graphID;
                }

                scriptNodes.push(node);
            }
        });

        return toBase64UTF8(JSON.stringify(root.object));
    }
};
