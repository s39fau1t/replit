const http = require("http"), fs = require("fs"), path = require("path"), URL = require("url").URL;

const server = http.createServer((req, res) => {
	switch(req.method) {
		case "GET": {
			fs.readFile("data.json", (error, content) => {
				if(error) {
					res.writeHead(500);
	
					res.end("500 Error not known");
				}else {
																																	//Screw you CORS >:(
					res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
	
					res.end(content);
				}
			});
			break;
		}
		case "POST": {
			let recievedData = "";
			
			req.on("data", chunk => {
				recievedData += chunk.toString();
			});

			req.on("end", () => {
				try {
					const recievedDataArr = JSON.parse(recievedData);

					if(!Array.isArray(recievedDataArr)) {
						res.writeHead(400);

						res.end("400 Bad request");

						return;
					}
					
					fs.readFile("data.json", (error, content) => {
						if(error) {
							res.writeHead(500);
			
							res.end("500 Error not known");
						}else {
							const dataArr = JSON.parse(content);
	
							dataArr.push(...recievedDataArr);
	
							const newData = JSON.stringify(dataArr);
	
							fs.writeFile("data.json", newData, error => {
								if(error) {
									res.writeHead(500);
					
									res.end("500 Error not known");
								}else {
									//                  CORS bad
									res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
	
									res.end("200 Success");
								}
							});
						}
					});
				}catch(error) {
					if(error instanceof SyntaxError) {
						res.writeHead(400);

						res.end("400 Bad request");
					}else {
						throw error;
					}
				}
			});
			break;
		}
		case "PUT": {
			let recievedData = "";
			
			req.on("data", chunk => {
				recievedData += chunk.toString();
			});

			req.on("end", () => {
				try {
					const recievedDataArr = JSON.parse(recievedData);

					if(!Array.isArray(recievedDataArr)) {
						res.writeHead(400);

						res.end("400 Bad request");

						return;
					}

					fs.writeFile("data.json", recievedData, error => {
						if(error) {
							res.writeHead(500);
			
							res.end("500 Error not known");
						}else {
							//                   CORS sucks
							res.writeHead(200, {"Access-Control-Allow-Origin": "*"});

							res.end("200 Success");
						}
					});
				}catch(error) {
					if(error instanceof SyntaxError) {
						res.writeHead(400);

						res.end("400 Bad request");
					}else {
						throw error;
					}
				}
			});
			break;
		}
		//SCREW YOU CORS >:(
		case "OPTIONS":
			res.writeHead(200, {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "*", "Access-Control-Allow-Headers": "*"});

			res.end("200 Success");
			break;
		default: {
			res.writeHead(501);
			
			res.end("501 Method not supported");
			break;
		}
	}
});

server.listen();