const http = require("http");

http.createServer((req, res) => {
	res.writeHead(301, {"Location": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"});

	res.end();
}).listen();