const http = require("http");
const fs = require("fs");

http.createServer((req, res) => {
	switch(req.method) {
		case "GET":
			if(req.url === "/") {
				res.writeHead(200, {"Access-Control-Allow-Origin": "*"});

				res.end();
				
				break;
			}
			
			fs.readFile(`.${req.url}`, (err, data) => {
				if(err) {
					if(err.code === "ENOENT") {
						res.writeHead(404, {"Access-Control-Allow-Origin": "*"});

						res.end();
					}else {
						res.writeHead(500, {"Access-Control-Allow-Origin": "*"});

						res.end();
					}
				}else {
					res.writeHead(200, {"Access-Control-Allow-Origin": "*"});

					res.end(data);
				}
			});
			break;
		default:
			res.writeHead(501, {"Access-Control-Allow-Origin": "*"});

			res.end();
			break;
	}
}).listen();