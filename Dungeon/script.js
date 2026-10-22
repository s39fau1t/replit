const webSocket = new WebSocket("wss://dungeon.cppbest.repl.co/");

let player;

let players = [];

let room;

webSocket.onmessage = event => {
	const message = JSON.parse(event.data);

	switch(message.type) {
		case "joinResponse":
			scene = "game";
			player = new Player(450, 450, 0);
			room = message.data;
			break;
		case "room":
			room = message.data;
			break;
		case "update":
			player.x = message.data.x;
			player.y = message.data.y;
			player.angle = message.data.angle;

			players = message.data.otherClients.map(client => new Player(client.x, client.y, client.angle));
			break;
	}
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let mouse = {x: 0, y: 0, down: false}, keys = [], scene = "menu";

function createSprite(src) {
  const image = new Image();
  image.src = src;
  return image;
};

const sprites = {
	player: createSprite("https://Dungeon.cppbest.repl.co/assets/images/player.png")
};

const rooms = [];

class Player {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
		this.health = 100;
		this.angle = angle;
    this.image = sprites.player;
		this.swordAng = 60;
  }

  draw() {
		if(mouse.down) {
			this.swordAng = 0;
		}

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.translate(15, 15);
		ctx.rotate(-Math.PI / 180 * this.swordAng);
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, 50, 25);
		ctx.restore();

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.drawImage(this.image, -30, -30, 60, 60);
		ctx.restore();

		//75
		ctx.save();
		ctx.fillStyle = "green";
		ctx.fillRect(Math.cos(this.angle - Math.PI / 180 * 30) * 75 + this.x, Math.sin(this.angle - Math.PI / 180 * 30) * 75 + this.y, 1, 1);
		ctx.fillRect(Math.cos(this.angle + Math.PI / 180 * 30) * 75 + this.x, Math.sin(this.angle + Math.PI / 180 * 30) * 75 + this.y, 1, 1);
		ctx.restore();
  }
}

//ctx.imageSmoothingEnabled = false;

function loop() {
  switch(scene) {
		case "menu":
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
			break;
    case "game":
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

			for(let row in room) {
				for(let col in room[row]) {
					const letter = room[row][col];

						const x = col * 50, y = row * 50;

						switch(letter) {
							case "b":
								ctx.fillStyle = "grey";
								ctx.fillRect(x, y, 50, 50);
								break;
							case "<":
							case ">":
							case "^":
							case "v":
								ctx.fillStyle = "brown";
								ctx.fillRect(x, y, 50, 50);
						}
				}
			}

			for(let player of players) {
				player.draw();
			}

      player.draw();
      //player.update();
      break;
  }
};

webSocket.onopen = () => {
	canvas.onmousemove = event => {
		const rect = canvas.getBoundingClientRect();

		mouse.x = event.clientX - rect.x;
		mouse.y = event.clientY - rect.y;

		if(scene === "game") {
			webSocket.send(JSON.stringify({type: "update", data: {keys: keys, mouse: mouse}}));
		}
	};

	canvas.onkeydown = event => {
		keys[event.keyCode] = true;
		if(scene === "game") {
			webSocket.send(JSON.stringify({type: "update", data: {keys: keys, mouse: mouse}}));
		}
	};

	canvas.onkeyup = event => {
		keys[event.keyCode] = false;
		if(scene === "game") {
			webSocket.send(JSON.stringify({type: "update", data: {keys: keys, mouse: mouse}}));
		}
	};

	window.onmousedown = () => {
		mouse.down = true;
		if(scene !== "game") {
			webSocket.send(JSON.stringify({type: "join"}));
		}else {
			webSocket.send(JSON.stringify({type: "update", data: {keys: keys, mouse: mouse}}));
		}
	};

	window.onmouseup = () => {
		mouse.down = false;
		if(scene === "game") {
			webSocket.send(JSON.stringify({type: "update", data: {keys: keys, mouse: mouse}}));
		}
	};

  setInterval(loop, 1000 / 60);
};