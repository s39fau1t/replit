const fs = require("fs");

let map;

map = JSON.parse(fs.readFileSync("./map.json"));

function addToMap(row, col, room) {
	let roomToReplace = map[row][col];

	for(let i in room) {
		//roomToReplace[i] = room[i];
	}

	//fs.writeFile("./map.json", JSON.stringify(map), err => {});
};

function collide(obj1, obj2) {
	return obj1.x + obj1.w > obj2.x && obj1.x < obj2.x + obj2.w && obj1.y + obj1.h > obj2.y && obj1.y < obj2.y + obj2.h;
};

function isJSON(data) {
	try {
		JSON.parse(data);
	}catch(error) {
		return false;
	}
	return true;
};

const createStaticServer = require("./node/staticServer"), wsUtils = require("./node/websocket");

const server = createStaticServer("map.json");

let clients = [];

server.on("upgrade", (req, socket) => {
  wsUtils.handshake(req, socket);

  clients.push({socket: socket, isAlive: true, isInGame: false, x: 450, y: 450, health: 100, w: 30, h: 64, keys: [], mouse: {x: 0, y: 0, press: false}, angle: 0});

  socket.on("data", buffer => {
    const sockets = clients.map(x => x.socket);

		const client = clients[sockets.indexOf(socket)];

    const messageBuffer = wsUtils.parseMessage(buffer);

		const message = isJSON(messageBuffer.data) ? JSON.parse(messageBuffer.data) : messageBuffer.data;

    switch(messageBuffer.opcode) {
      case 0x1:
        switch(message.type) {
					case "join":
						if(!client.isInGame) {
							let availibleRoom;

							for(let row in map) {
								for(let col in map[row]) {
									if(map[row][col].length === 0) {
										availibleRoom = {row: parseFloat(row), col: parseFloat(col)};
										break;
									}
								}
								if(availibleRoom) {
									break;
								}
							}

							if(!availibleRoom) {
								return;
							}

							try {
								client.isInGame = true;
								client.row = availibleRoom.row;
								client.col = availibleRoom.col;
							}catch(error) {}

							const startingRoom = [
								"bbbbbbbbbbbbbbbbbb",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"<                >",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"b                b",
								"bbbbbbbbbbbbbbbbbb"
							];

							addToMap(availibleRoom.row, availibleRoom.col, startingRoom);

							socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "joinResponse", data: startingRoom})));
						}
						break;
          case "update":
						try {
							client.keys = message.data.keys;
							client.mouse.x = message.data.mouse.x;
							client.mouse.y = message.data.mouse.y;
							client.mouse.press = message.data.mouse.down;
						}catch(error) {}
            break;
        }
        break;
      case 0x8:
        clients.splice(clients.indexOf(client), 1);
        break;
			case 0xA:
				try {
					client.isAlive = true;
				}catch(error) {}
				break;
      case null:
				socket.write(wsUtils.createMessage(0x8, message.data));
        break;
    }
  });

	socket.on("error", error => {
		const states = clients.map(client => client.socket.readyState);

		for(let state in states) {
			if(state !== "open") {
				clients.splice(states.indexOf(state));
			}
		}
	});
});

setInterval(() => {
	for(let client of clients) {
		if(client.isAlive) {
			client.socket.write(wsUtils.createMessage(0x9));
			client.isAlive = false;
		}else {
			client.socket.destroy();
			clients.splice(clients.indexOf(client), 1);
		}
	}
}, 30000);

function loop() {
	for(let client of clients) {
		if(client.isInGame) {
			client.angle = Math.atan2(client.mouse.y - client.y, client.mouse.x - client.x);

			if(client.keys[65]) {
				client.x -= 2;
			}
			if(client.keys[68]) {
				client.x += 2;
			}

			for(let row in map[client.row][client.col]) {
				for(let col in map[client.row][client.col][row]) {
					const letter = map[client.row][client.col][row][col];

					const block = {x: col * 50, y: row * 50, w: 50, h: 50};

					if(collide(client, block)) {
						switch(letter) {
							case "b":
								if(client.x < block.x) {
									client.x = block.x - client.w;
								}else if(client.x > block.x) {
									client.x = block.x + block.w;
								}
								break;
							case "<":
								client.col --;
								client.x = 450;
								client.y = 450;
								break;
							case ">":
								client.col ++;
								client.x = 450;
								client.y = 450;
								break;
							case "^":
								client.row --;
								client.x = 450;
								client.y = 450;
								break;
							case "v":
								client.row ++;
								client.x = 450;
								client.y = 450;
								break;
						}
					}
				}
			}

			if(client.keys[87]) {
				client.y -= 2;
			}
			if(client.keys[83]) {
				client.y += 2;
			}

			for(let row in map[client.row][client.col]) {
				for(let col in map[client.row][client.col][row]) {
					const letter = map[client.row][client.col][row][col];

					const block = {x: col * 50, y: row * 50, w: 50, h: 50};

					switch(letter) {
						case "b":
							if(collide(client, block)) {
								if(client.y < block.y) {
									client.y = block.y - client.h;
								}else if(client.y > block.y) {
									client.y = block.y + block.h;
								}
							}
							break;
					}
				}
			}
			
			let otherClients = [];

			for(let otherClient of clients) {
				if(otherClient !== client && otherClient.isInGame) {
					if(otherClient.row === client.row && otherClient.col === client.col) {
						otherClients.push({x: otherClient.x, y: otherClient.y, angle: otherClient.angle});
					}
				}
			}

			if(client.mouse.press) {
				
			}

			if(client.health <= 0) {
				client.health = 100;
				client.isInGame = false;
			}

			client.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "update", data: {x: client.x, y: client.y, angle: client.angle, health: client.health, inGame: client.isInGame, otherClients: otherClients}})));

			client.mouse.press = false;
		}
	}
};

setInterval(loop, 1000 / 60);

server.listen(8000);