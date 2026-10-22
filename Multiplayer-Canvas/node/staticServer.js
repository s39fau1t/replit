/**
 * A simple static server that can handle and deny certain get requests
 * @module staticServer
 */

const http = require("http"), fs = require("fs"), path = require("path"), Url = require("url").URL;
/**
 * Creates a static server
 * @param {...string} [secretFiles] - Files to deny the client acess from
 * @returns {Object} An http server object that can handle get requests
 */
module.exports = (...secretFiles) => {
	return http.createServer((req, res) => {
		if(req.method === "GET") {
			const url = new Url(req.url, "https://Dungeon.danielrichards9.repl.co");

			let filePath = `.${decodeURIComponent(url.pathname)}`;
			if(filePath === "./") {
				filePath = "./index.html";
			}

			if(secretFiles.includes(filePath.slice(2))) {
				res.writeHead(404);
				res.end("404 File not found");
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
			res.writeHead(501);
			res.end("501 Method not supported");
		}
	});
};