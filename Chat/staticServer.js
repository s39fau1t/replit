const http = require("http"), fs = require("fs"), path = require("path"), { URL: Url } = require("url");

module.exports = (clients) => {
  return http.createServer((req, res) => {
    if(req.method === "GET") {
      const pathUrl = new Url(req.url, "https://chat.danielrichards9.repl.co/");
      if(pathUrl.pathname !== "/username-check") {
        let filePath = "." + pathUrl.pathname;
        if(filePath === "./") {
          filePath = "./index.html";
        }

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
      }else {
        const newName = pathUrl.search.slice(6).replace("%20", " ");
        const names = clients.map(client => client.username);
        res.writeHead(200);
        for(let name of names) {
          if(newName === name) {
            res.end("taken");
            return;
          }
        }
        res.end("free");
      }
    }else {
      res.writeHead(501);
      res.end("501 Method not supported");
    }
  });
};