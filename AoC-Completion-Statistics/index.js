const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

function getStats() {
	return new Promise((resolve, reject) => {
		https.get("https://adventofcode.com/2022/stats", res => {
			let str = "";

			res.on("data", chunk => {
				str += chunk;
			});

			res.on("end", () => {
				const matches = [...str.matchAll(/<a href=".*"> *\d+ *<span class="stats-both"> *(\d+)<\/span>  <span class="stats-firstonly"> *(\d+)<\/span>/g)].reverse();

				const data = {both: [], firstOnly: []};

				for(let match of matches) {
					data.both.push(parseInt(match[1]));
					data.firstOnly.push(parseInt(match[2]));
				}

				resolve(JSON.stringify(data));
			});
		});
	});
}

getStats().then(data => {
	http.createServer((req, res) => {
			if(req.method === "GET") {
				const url = new URL(req.url, `https://${req.headers.host}`);
	
				let filePath = `.${decodeURIComponent(url.pathname)}`;
				if(filePath === "./") {
					filePath = "./index.html";
				}else if(filePath === "./stats") {
					res.writeHead(200, {"Content-Type": "application/json"});

					res.end(data);

					return;
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
	}).listen();

	setInterval(async () => {
		data = await getStats();
	}, 900000);
});