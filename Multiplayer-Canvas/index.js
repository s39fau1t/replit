const server = require("./node/staticServer")(), wsUtils = require("./node/websocket");

let clients = [];

function isJSON(data) {
	try {
		JSON.parse(data);
	}catch(error) {
		return false;
	}

	return true;
};

server.on("upgrade", (req, socket) => {
	wsUtils.handshake(req, socket);

	clients.push({socket: socket});

	socket.on("data", buffer => {
		const messageBuffer = wsUtils.parseMessage(buffer);

		const message = isJSON(messageBuffer.data) ? JSON.parse(messageBuffer.data) : messageBuffer.data;

		const sockets = clients.map(client => client.socket);

		const client = clients[sockets.indexOf(socket)];

		switch(messageBuffer.opcode) {
			case 0x1:
				console.log(message);

				for(let otherClient of clients) {
					if(otherClient !== client) {
						otherClient.socket.write(wsUtils.createMessage(0x1, JSON.stringify({x: message.x, y: message.y})));
					}
				}
				break;
			case 0x8:
				clients.splice(clients.indexOf(client));
				break;
		}
	});
});

server.listen();