const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
  let filePath = "." + req.url;
  if(filePath === "./") {
    filePath = "./index.html";
  }
  
  if(req.method === "GET") {
    const extname = path.extname(filePath);

    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm"
    };

    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
      if(err) {
        if(err.code === "ENOENT") {
          res.writeHead(404);
          res.end("404 File not found");
        }else {
          res.writeHead(500);
          res.end("500 Error not known");
        }
      }else {
        res.writeHead(200, {"Content-type": contentType});
        res.end(content);
      }
    });
  }else if(req.method === "PUT") {
    if(filePath === "./leaderboard.json") {
      req.on("data", chunk => {
        const data = chunk.toString();
        
        if(Array.isArray(JSON.parse(data)) && JSON.parse(data).length === 10) {
          fs.writeFile(filePath, data, err => {
            if(err) {
              res.writeHead(500);
              res.end("500 Error nor known");
            }else {
              res.writeHead(200);
              res.end("Data succesfully replaced");
            }
          });
        }else {
          res.writeHead(400);
          res.end("Leaderboard must be set to an array with a length of 10");
        }
      });
    }else {
      res.writeHead(405, {Allow: "GET"});
      res.end("Don't change the other files!");
    }
  }
});

server.listen(8000);