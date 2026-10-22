import http from "http";

import Koa from "koa";
import serve from "koa-static";
import {WebSocketServer} from "ws";

const app = new Koa();

app.use(serve("public"));

const server = http.createServer(app.callback());

const wss = new WebSocketServer({server});

const sockets = [];

wss.on("connection", ws => {
	sockets.push(ws);
	
	ws.on("error", console.error);

	ws.on("message", data => {
		const message = JSON.parse(data);

		for(let socket of sockets) {
			socket.send(`${socket === ws ? "You" : message.username}: ${message.message}`);
		}
	});
});

server.listen();