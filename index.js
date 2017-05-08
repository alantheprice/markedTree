const http = require("http");
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;

const DEFAULT_PORT = 3500;
var port = DEFAULT_PORT;

process.argv.forEach(function (val, index, array) {
  // First two arguments will be node and this file path.
  if (index > 1) {
    console.log(index + ': ' + val);
    port = parseInt(val);
  }

});

const mimeTypes = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".wav": "audio/wav"
};

const reDirectMap = {
    "./": __dirname + "/index.html",
    "./index.html": __dirname + "/index.html",
    "./style.css": __dirname + "/style.css",
    "./node_modules/marked/marked.min.js": getMarkedPath(),
    "./src/link.js":  __dirname + "/src/link.js",
    "./src/main.js":  __dirname + "/src/main.js",
};

function getMarkedPath() {
    if (__dirname.indexOf("node_modules") > -1) {
        // in this case we have been installed and need to find marked as a sibling.
        return (__dirname + "/marked/marked.min.js").replace("/marked-tree", "");
    } else {
        return __dirname + "/node_modules/marked/marked.min.js";
    }
}

http.createServer(function (request, response) {
    console.log(["Url:", request.url].join(" "));
    console.log(__dirname);

    // only add a dot to the current path if it is not already added.
    var filePath = (request.url.indexOf(".") === 0) ? request.url : "." + request.url;

    // attempting to go beyond the served directory should be stopped.
    if (filePath.indexOf("..") === 0) {
        response.writeHead(403, "File path not allowed.");
        return;
    }

    // Redirect for core served files needed to be directly relative to the 
    filePath = reDirectMap[filePath] || filePath;

    console.log(filePath);

    var extname = path.extname(filePath);
    var contentType = mimeTypes[extname] || "text/html";

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == "ENOENT"){
                response.writeHead(404, "File not found");
                response.end();
            }
            else {
                response.writeHead(500);
                response.end("Sorry, check with the site admin for error: " + error.code + " ..\n");
            }
        }
        else {
            response.writeHead(200, { "Content-Type": contentType });
            response.end(content, "utf-8");
        }
    });

}).listen(port);

spawn("open", ["http://127.0.0.1:" + port + "#README.md"]);

console.log(["Server running at http://127.0.0.1:", port, "/"].join(""));
