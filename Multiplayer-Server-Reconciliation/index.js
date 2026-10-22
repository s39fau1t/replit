const server = require("./node/staticServer.js")(), wsUtils = require("./node/websocket.js");

function dist(x1, y1, x2, y2) {
	return Math.hypot(x1 - x2, y1 - y2);
}

function rotatedRectToCircle(rectX, rectY, rectWidth, rectHeight, rectAngle, circleX, circleY, circleRad) {
	const rectCenterX = rectX + rectWidth / 2, rectCenterY = rectY + rectHeight / 2;
	
	const unrotatedCircleX = Math.cos(rectAngle) * (circleX - rectCenterX) - Math.sin(rectAngle) * (circleY - rectCenterY) + rectCenterX;

	const unrotatedCircleY = Math.sin(rectAngle) * (circleX - rectCenterX) + Math.cos(rectAngle) * (circleY - rectCenterY) + rectCenterY;

	const closestX = unrotatedCircleX < rectX ? rectX : unrotatedCircleX > rectX + rectWidth ? rectX + rectWidth : unrotatedCircleX, closestY = unrotatedCircleY < rectY ? rectY : unrotatedCircleY > rectY + rectHeight ? rectY + rectHeight : unrotatedCircleY;

	return dist(unrotatedCircleX, unrotatedCircleY, closestX, closestY) < circleRad;
}

class Bullet {
	constructor(x, y, angle, owner) {
		this.x = x;
		this.y = y;

		this.angle = angle;

		this.owner = owner;
	}

	update() {
		this.x += Math.cos(this.angle) * 10;
		this.y += Math.sin(this.angle) * 10;
	}
}

class Client {
	constructor(socket) {
		this.socket = socket;

		this.alive = true;

		this.sequenceNumber = 0;

		this.x = 500;
		this.y = 500;

		this.load = 50;

		this.hits = 0;
		
		this.messages = [];
	}

	update() {
		for(let message of this.messages) {
			if(message.left) {
				this.x -= 2;
			}

			if(message.right) {
				this.x += 2;
			}

			if(message.up) {
				this.y -= 2;
			}

			if(message.down) {
				this.y += 2;
			}

			if(message.shoot && this.load <= 0) {
				bullets.push(new Bullet(this.x, this.y, message.angle, this));
				
				this.load = 50;
			}

			this.sequenceNumber = message.sequenceNumber;
		}
		
		this.messages.splice(0, this.messages.length);

		for(let i = 0; i < 6; i ++) {
			this.load --;
		}
	}
}

const clients = [], bullets = [];

server.on("upgrade", (req, socket) => {
	console.log("A client connected");
	
	wsUtils.handshake(req, socket);

	clients.push(new Client(socket));

	socket.on("data", buffer => {
		try {
			const messageBuffer = wsUtils.parseMessage(buffer);

			const message = JSON.parse(messageBuffer.data);

			const sockets = clients.map(client => client.socket);

			const client = clients[sockets.indexOf(socket)];

			switch(messageBuffer.opcode) {
				case 0x1:
					client.messages.push(message);
					break;
				case 0xA:
					client.alive = true;
					break;
				case 0x8:
					console.log("A client disconnected");
					
					clients.splice(clients.indexOf(client), 1);
					break;
			}
		}catch(error) {
			socket.write(wsUtils.createMessage(0x8, error.message));

			clients.splice(clients.map(client => client.socket).indexOf(socket), 1);
		}
	});
});

setInterval(() => {
	for(let i = clients.length - 1; i >= 0; i --) {
		const client = clients[i];
		
		if(client.alive) {
			client.socket.write(wsUtils.createMessage(0x9));
			
			client.alive = false;
		}else {
			console.log("No pong :(");
			
			client.socket.destroy();

			clients.splice(i, 1);
		}
	}
}, 30000);

//Game loop
function loop() {
	//Update clients once
	for(let client of clients) {
		client.update();
	}

	//Update game objects 6 times to match 60 fps
	for(let i = 0; i < 6; i ++) {
		for(let i = bullets.length - 1; i >= 0; i --) {
			const bullet = bullets[i];
			
			bullet.update();

			if(bullet.x < -50 || bullet.x > 1050 || bullet.y < -50 || bullet.y > 1050) {
				bullets.splice(i, 1);

				continue;
			}

			for(let client of clients) {
				if(client === bullet.owner) {
					continue;
				}
				
				if(rotatedRectToCircle(bullet.x, bullet.y, 20, 10, bullet.angle, client.x, client.y, 20)) {
					bullet.owner.hits ++;

					bullets.splice(i, 1);

					break;
				}
			}
		}
	}

	const gameData = [], bulletData = [];

	for(let client of clients) {
		gameData.push({x: client.x, y: client.y, hits: client.hits});
	}

	for(let bullet of bullets) {
		bulletData.push({x: bullet.x, y: bullet.y, angle: bullet.angle});
	}

	for(let client of clients) {
		const otherPlayers = gameData.slice(0, clients.indexOf(client)).concat(gameData.slice(clients.indexOf(client) + 1, gameData.length));
		
		client.socket.write(wsUtils.createMessage(0x1, JSON.stringify({type: "update", sequenceNumber: client.sequenceNumber, you: gameData[clients.indexOf(client)], players: otherPlayers, bullets: bulletData})));
	}
}

setInterval(loop, 1000 / 10);

server.listen();