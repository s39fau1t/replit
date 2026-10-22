const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const mouse = {x: 0, y: 0, down: false, click: false, press: false}, keys = {};

canvas.onkeydown = event => {
	keys[event.key] = true;

	if(event.key === " ") {
		event.preventDefault();
	}
};

canvas.onkeyup = event => {
	keys[event.key] = false;
};

canvas.onmousemove = event => {
	const rect = canvas.getBoundingClientRect();

	mouse.x = event.clientX - rect.x;
	mouse.y = event.clientY - rect.y;
};

canvas.onmousedown = () => {
	mouse.down = true;
	mouse.press = true;
};

canvas.onmouseup = () => {
	mouse.down = false;

	mouse.click = true;
};

const webSocket = new WebSocket("wss://Multiplayer-Client-Side-Prediction.danielrichards9.repl.co");

class Player {
	constructor() {
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;

		this.angle = 0;

		this.hits = 0;
	}
	
	draw() {
		ctx.save();

		ctx.fillStyle = "blue";

		ctx.beginPath();
		
		ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
		
		ctx.fill();

		ctx.fillStyle = "grey";

		ctx.font = "20px Sans-Serif";

		ctx.textAlign = "center";

		ctx.textBaseline = "middle";

		ctx.fillText(this.hits, this.x, this.y);

		ctx.restore();
	}

	update() {
		this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
		
		const left = Boolean(keys["a"] || keys["ArrowLeft"]), right = Boolean(keys["d"] || keys["ArrowRight"]), up = Boolean(keys["w"] || keys["ArrowUp"]), down = Boolean(keys["s"] || keys["ArrowDown"]);

		if(left) {
			this.x -= 2;
		}

		if(right) {
			this.x += 2;
		}

		if(up) {
			this.y -= 2;
		}

		if(down) {
			this.y += 2;
		}

		if(left || right || up || down || mouse.down) {
			webSocket.send(JSON.stringify({type: "update", left: left, right: right, up: up, down: down, shoot: mouse.down, angle: this.angle}));
		}
	}
}

class Enemy {
	constructor(x, y, hits) {
		this.x = x;
		this.y = y;

		this.hits = hits;
	}
	
	draw() {
		ctx.save();

		ctx.fillStyle = "red";

		ctx.beginPath();
		
		ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
		
		ctx.fill();

		ctx.fillStyle = "black";

		ctx.font = "20px Sans-Serif";

		ctx.textAlign = "center";

		ctx.textBaseline = "middle";

		ctx.fillText(this.hits, this.x, this.y);

		ctx.restore();
	}
}

class Bullet {
	constructor(x, y, angle) {
		this.x = x;
		this.y = y;

		this.angle = angle;
	}

	draw() {
		ctx.save();

		ctx.fillStyle = "black";

		ctx.translate(this.x, this.y);

		ctx.rotate(this.angle);

		ctx.fillRect(0, 0, 20, 10);

		ctx.restore();
	}
}

const player = new Player();

const enemies = [], bullets = [];

function loop() {
	ctx.save();

	ctx.fillStyle = "white";

	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for(let bullet of bullets) {
		bullet.draw();
	}

	for(let enemy of enemies) {
		enemy.draw();
	}
	
	player.update();
	player.draw();

	ctx.restore();
}

webSocket.onmessage = event => {
	const message = JSON.parse(event.data);
	
	player.x = message.you.x;
	player.y = message.you.y;

	player.hits = message.you.hits;

	enemies.splice(0, enemies.length);

	for(let player of message.players) {
		enemies.push(new Enemy(player.x, player.y, player.hits));
	}

	bullets.splice(0, bullets.length);

	for(let bullet of message.bullets) {
		bullets.push(new Bullet(bullet.x, bullet.y, bullet.angle));
	}
};

webSocket.onopen = () => {
	setInterval(loop, 1000 / 60);
};