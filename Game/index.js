const {URL} = require("url"), wsUtils = require("./node/websocket"), createStaticServer = require("./node/staticServer");

class Room {
	constructor(name, maxPlayers) {
		this.name = name;

		this.owner = null;

		this.maxPlayers = maxPlayers;

		this.players = [];

		this.loop = null;

		this.inGame = false;

		setTimeout(() => {
			if(!this.owner) {
				rooms.splice(rooms.indexOf(this), 1);
			}
		}, 10000);
	}
}

class Building {
	constructor(x, y, width, height, id) {
		this.x = x;
		this.y = y;

		this.width = width;
		this.height = height;

		this.id = id;
	}
}

class Unit {
	constructor(x, y, width, height, id) {
		this.x = x;
		this.y = y;

		this.width = width;
		this.height = height;

		this.position = {
			x: x,
			y: y
		};

		this.id = id;
	}

	update() {
		if(this.position.x < this.x) {
			this.x ++;
		}else if(this.position.x > this.x) {
			this.x --;
		}

		if(this.position.y < this.y) {
			this.y ++;
		}else if(this.position.y < this.y) {
			this.y --;
		}
	}
}

class Player {
	constructor(name, socket, room) {
		this.name = name;
		
		this.socket = socket;

		this.room = room;

		this.messages = [];

		this.buildings = [];

		this.units = [];
	}
}

const rooms = [];

const server = createStaticServer((req, res) => {
	const url = new URL(req.url, `https://${req.headers.host}`);
	
	switch(url.pathname) {
		case "/rooms": {
			switch(req.method) {
				case "GET":
					const roomsToSend = [];

					for(let room of rooms) {
						if(room.players.length) {
							roomsToSend.push({name: room.name, players: room.players.length, maxPlayers: room.maxPlayers});
						}
					}
					
					res.writeHead(200);
			
					res.end(JSON.stringify(roomsToSend));

					break;
				case "POST":
					let data = "";
					
					req.on("data", chunk => {
						data += chunk.toString();
					});

					req.on("end", () => {
						rooms.push(new Room(data, 10));

						res.writeHead(200);

						res.end("200 Room successfully created");
					});
					break;
				default:
					res.writeHead(501);
					
					res.end("501 Method not supported");
					break;
				}
	
			return false;
		}
		case "/room": {
			if(req.method === "GET") {
				const room = rooms[rooms.map(room => room.name).indexOf(decodeURIComponent(url.searchParams.get("room")))];

				if(!room) {
					res.writeHead(400);

					res.end("400 Bad Request");

					return false;
				}

				res.writeHead(200);

				res.end(JSON.stringify({players: room.players.map(player => ({name: player.name, isOwner: player === room.owner})), maxPlayers: room.maxPlayers}));
			}else {
				res.writeHead(501);
				
				res.end("501 Method not supported");
			}

			return false;
		}
		default: {
			return true;
		}
	}
});

server.on("upgrade", (req, socket) => {
	const url = new URL(req.url, "https://Game.danielrichards9.repl.co");

	const room = rooms[rooms.map(room => room.name).indexOf(decodeURIComponent(url.searchParams.get("room")))];
	
	if(!room || room.players === room.maxPlayers || room.inGame) {
		socket.end("Error joining room");

		return;
	}
	
	wsUtils.handshake(req, socket);

	const player = new Player(decodeURIComponent(url.searchParams.get("name")), socket, rooms.indexOf(room));

	if(room.players.length === 0) {
		room.owner = player;
	}

	room.players.push(player);
	
	for(let otherPlayer of room.players) {
		otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "playersUpdate", data: room.players.map(player => ({name: player.name, isOwner: player === room.owner}))})));
		otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "chat", data: `${otherPlayer === player ? "You" : player.name} joined the game.`})));
	}

	console.log("A client connected");

	socket.on("data", buffer => {
		const messageBuffer = wsUtils.parseMessage(buffer);

		switch(messageBuffer.opcode) {
			case 0x1:
				const message = JSON.parse(messageBuffer.data);

				const {players} = room;

				if(!room.inGame) {
					switch(message.type) {
						case "chat":
							for(let otherPlayer of players) {
								otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "chat", data: `${otherPlayer === player ? "You" : player.name}: ${message.data}`})));
							}
							break;
						case "start":
							//Add check to see if counting down or in game
							if(player === room.owner && !room.inGame) {
								room.inGame = true;
								
								let countdown = 5;
								
								const countdownInterval = setInterval(() => {
									if(countdown) {
										for(let player of players) {
											player.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "countdown", data: countdown})));
										}
		
										countdown --;
									}else {
										for(let player of players) {
											player.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "loading"})));
										}

										//Init players
										//Later make it so that it chooses different positions for each player
										player.buildings.push(new Building(100, 100, 100, 100, 0));
	
										player.units.push(new Unit(300, 300, 10, 20, 0));

										//Generate recources (trees, ores, and the like) WIP

										//Pathfinding preprocessing
										
										//Start game
										for(let player of players) {
											//Include some info on the players' starting location
											player.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "start", data: {baseX: player.buildings[0].x, baseY: player.buildings[0].y}})));
										}
	
										room.loop = setInterval(() => {
											//Process player messages
											for(let player of players) {
												for(let message of player.messages) {
													switch(message.type) {
														case "move":
															for(let unit of player.units) {
																if(message.data.ids.includes(unit.id)) {
																	unit.position.x = message.data.x;
																	unit.position.y = message.data.y;
																}
															}
															break;
													}
												}

												player.messages.splice(0);
											}

											//Update game objects
											for(let i = 0; i < 6; i ++) {
												for(let player of players) {
													for(let unit of player.units) {
														unit.update();
													}
												}
											}
											
											const state = {
												buildings: [],
												units: []
											};
											
											//Gather game state
											for(let player of players) {
												for(let building of player.buildings) {
													state.buildings.push({x: building.x, y: building.y, id: building.id});
												}

												for(let unit of player.units) {
													state.units.push({x: unit.x, y: unit.y, id: unit.id});
												}
											}
											
											for(let player of players) {
												//Send game state!
												player.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "update", data: state})));
											}
										}, 1000 / 10);
										
										clearInterval(countdownInterval);
									}
								}, 1000);

								//Clear buildings and units
								for(let player of players) {
									player.buildings.splice(0);
									player.units.splice(0);
								}
							}
							break;
					}
				}else {
					switch(message.type) {
						case "chat":
							for(let otherPlayer of players) {
								otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "chat", data: `${otherPlayer === player ? "You" : player.name}: ${message.data}`})));
							}
							break;
						//Have all possible commands here
						case "move":
							player.messages.push(message);
							break;
					}
				}
				break;
			case 0x8:
				player.socket.write(wsUtils.createMessage(0x8));
				
				room.players.splice(room.players.indexOf(player), 1);

				for(let otherPlayer of room.players) {
					otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "playersUpdate", data: room.players.map(player => ({name: player.name, isOwner: player === room.owner}))})));
					otherPlayer.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "chat", data: `${player.name} left the game.`})));
				}

				if(!room.players.length) {
					rooms.splice(rooms.indexOf(room));
				}
				
				console.log("A client disconnected");
				break;
		}
	});
});

server.listen();