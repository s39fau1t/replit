/**
 * A simple static server that can handle and deny certain get requests
 * @module staticServer
 */

const http = require("http"), fs = require("fs"), path = require("path"), {URL} = require("url");

/**
 * @callback beforeResponse
 * @param {http.IncomingMessage} req The incoming HTTP request
 * @param {http.OutgoingMessage} res The outgoing HTTP response
 * @returns {boolean} respond Whether or not to respond to the request 
 */

/**
 * Creates a static server
 * @param {beforeResponse} [beforeResponse] - A callback ran after the request is recieved
 * @returns {Object} An http server object that can handle get requests
 */
module.exports = (beforeResponse) => {
	return http.createServer((req, res) => {
		if(beforeResponse) {
			const respond = beforeResponse(req, res);

			if(!respond) {
				return;
			}
		}
		
		if(req.method === "GET") {
			const url = new URL(req.url, `https://${req.headers.host}`);

			let filePath = `.${decodeURIComponent(url.pathname)}`;
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
			res.writeHead(501);
			
			res.end("501 Method not supported");
		}
	});
}