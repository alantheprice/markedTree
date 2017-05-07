const http = require("http");
const fs = require("fs");
const path = require("path");

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

const fileMap = {

};

http.createServer(function (request, response) {
    console.log(["Url:", request.url].join(" "));
    console.log(__dirname);

    // only add a dot to the current path if it is not already added.
    var filePath = (request.url.indexOf(".") === 0) ? request.url : "." + request.url;

    // attempting to go beyond the served directory should be stopped.
    if (filePath.indexOf("..") === 0) {
        response.writeHead(500, "File path not allowed.");
        return;
    }

    // FIXME: Do a map for these files instead of this mess.
    if (filePath === "./" || filePath === "./index.html") {
        filePath = __dirname + "/index.html";
    } else if (filePath.indexOf("style.css") > -1) {
        filePath = __dirname + "/style.css";
    } else if (filePath.indexOf("marked.min.js") > -1) {
        filePath = __dirname + "/node_modules/marked/marked.min.js";
    } else if (filePath.indexOf("src/link.js") > -1) {
        filePath = __dirname + "/src/link.js";
    } else if (filePath.indexOf("src/main.js") > -1) {
        filePath = __dirname + "/src/main.js";
    }

    var extname = path.extname(filePath);
    var contentType = mimeTypes[extname] || "text/html";

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == "ENOENT"){
                // could redirect here to a 404,
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

console.log(["Server running at http://127.0.0.1:", port, "/"].join(""));
