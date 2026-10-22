//Canvas and 2d drawing context
const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

//Set the canvas' width in pixles to its actual width on the screen
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

//User input
const mouse = {x: 0, y: 0, down: false, click: false, press: false}, keys = {};

let scene = "menu";

//Event listeners for input
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

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function collide(obj1, obj2) {
	return obj1.x + obj1.w > obj2.x && obj1.x < obj2.x + obj2.w && obj1.y + obj1.h > obj2.y && obj1.y < obj2.y + obj2.h;
}

function toImage(canvas) {
	const image = new Image();

	image.src = canvas.toDataURL();

	return image;
}

let upgrades;

const waves = [
	"eee",
	"eeeee",
	"eeeeeeeeee",
	"eae",
	"eeeeeeeeeeesssss",
	"eeeeeeeeeeeeessssssssss",
	"sbs",
	"ssssssssssssssssssssssss",
	"eeeeeeeeeeeeeeeeeeeeeeeeeeeeesssssssssssssssss",
	"esfse"
];

let curWave = -1;

let playerBullets = [];
let enemyBullets = [];

function genCloud(numPoints) {
	const points = [];

	for(let i = 0; i < numPoints; i ++) {
		const randX = random(Math.cos(i / 5) * -100, Math.cos(i / 5) * 100), randY = random(Math.sin(i / 5) * -50, Math.sin(i / 5) * 50);
		points.push({ x: randX, y: randY });
	}

	return points;
}

const audioCtx = new AudioContext();

class Sound {
	constructor(buffer) {
		this.buffer = buffer;

		this.sources = [];
	}

	play(volume = 1, loop = false) {
		const source = audioCtx.createBufferSource();

		this.sources.push(source);

		source.buffer = this.buffer;

		source.loop = loop;

		const gainNode = audioCtx.createGain();

		gainNode.gain.value = volume;

		gainNode.connect(audioCtx.destination);

		source.connect(gainNode);

		source.onended = () => {
			source.disconnect();

			this.sources.splice(this.sources.indexOf(source));
		};

		source.start(0);
	}

	stop() {
		this.sources[this.sources.length - 1].stop();
	}
}

class Button {
	constructor(x, y, w, h, animInc, animDec, draw, onPress) {
		this.x = x;
		this.y = y;

		this.w = w;
		this.h = h;

		this.animTimer = 0;

		this.animInc = animInc;
		this.animDec = animDec;

		this.display = draw;
		this.onPress = onPress;
	}

	draw() {
		this.display(this.x, this.y, this.w, this.h, this.animTimer);
	}

	update() {
		const isOver = mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h;

		if(isOver) {
			this.animTimer = this.animInc(this.animTimer);

			if(mouse.click) {
				this.animTimer = 0;

				this.onPress();
			}
		}else {
			if(this.animTimer > 0) {
				this.animTimer = this.animDec(this.animTimer);
			}
		}
	}
}

class Credits {
	constructor() {
		this.y = 0;

		this.done = false;

		this.text = [
			"PLANE GAME",
			"",
			"A game by cppbest",
			"",
			"",
			"",
			"GRAPHICS",
			"",
			"Plane",
			"https://freesvg.org/blue-biplane",
			"",
			"First Boss",
			"https://freesvg.org/b-24-bomber-plane-vector-image",
			"",
			"Second Boss",
			"https://freesvg.org/p-51-b-mustang-iii",
			"",
			"Final Boss",
			"https://freesvg.org/mil-mi-17-colored-czech-air-force-remix-by-juhele",
			"",
			"Bomb",
			"https://openclipart.org/detail/250029/atomic-bomb",
			"",
			"Clock",
			"https://publicdomainvectors.org/en/free-clipart/Clock-face-vector-illustration/12265.html",
			"",
			"Explosion",
			"https://publicdomainvectors.org/en/free-clipart/Explosion-vector-illustration/7296.html",
			"",
			"",
			"AUDIO",
			"",
			"All music and sound effects are from zapsplat.com",
			"",
			"",
			"SPECIAL THANKS",
			"",
			"You, the player",
			"Thanks for playing!"
		];
	}

	draw() {
		ctx.save();

		ctx.fillStyle = "black";
		ctx.font = "20px Sans-Serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		ctx.translate(canvas.width / 2, canvas.height + this.y);

		for(let row in this.text) {
			ctx.save();

			const y = row * 30;

			if(row === "0") {
				ctx.font = "50px Sans-Serif";
			}

			ctx.fillText(this.text[row], 0, y);

			ctx.restore();
		}

		ctx.restore();
	}

	update() {
		this.y --;

		if(this.y + canvas.height < -(this.text.length + 5) * 30) {
			this.done = true;
		}
	}
}

class Alert {
	constructor(text) {
		this.text = text;

		this.width = 0;

		ctx.save();

		ctx.font = "100px Sans-Serif";

		const txtMetrics = ctx.measureText(text);

		this.maxWidth = txtMetrics.width + 50;

		ctx.restore();

		this.alpha = 1;
	}

	draw() {
		ctx.save();

		ctx.fillStyle = "grey";

		ctx.globalAlpha = this.alpha;

		ctx.fillRect(canvas.width / 2 - this.width / 2, 20, this.width, 20);

		ctx.font = "100px Sans-Serif";

		ctx.fillText(this.text, canvas.width / 2 - (this.maxWidth - 50) / 2, 120);

		ctx.fillRect(canvas.width / 2 - this.width / 2, 150, this.width, 20);

		ctx.restore();
	}

	update() {
		if(this.width < this.maxWidth) {
			this.width += (this.maxWidth - this.width) * 0.05;
		}

		this.alpha -= 0.004;
	}
}

class CameraShake {
	constructor(spread, duration) {
		this.spread = spread;
		this.duration = duration;
	}

	update() {
		ctx.translate(random(-this.spread / 2, this.spread / 2), random(-this.spread / 2, this.spread / 2));

		this.duration --;
	}
}

class Cloud {
	constructor(x, y) {
		this.clouds = [];
		this.x = x;
		this.y = y;

		for(let i = 0; i < 2; i ++) {
			this.clouds.push(genCloud(100));
		}
	}

	draw() {
		ctx.save();
		ctx.fillStyle = "white";
		ctx.globalAlpha = 0.3;
		for(let cloud of this.clouds) {
			ctx.beginPath();
			for(let point of cloud) {
				ctx.moveTo(point.x + this.x, point.y + this.y);
				ctx.arc(point.x + this.x, point.y + this.y, 15, 0, Math.PI * 2);
			}
			ctx.fill();
		}
		ctx.restore();
	}

	update() {
		this.x --;
	}
}

class Smoke {
	constructor(x, y, rad) {
		this.x = x;
		this.y = y;

		this.rad = rad;

		this.alpha = 1;
	}

	draw() {
		ctx.save();

		ctx.fillStyle = "grey";
		ctx.globalAlpha = this.alpha;

		ctx.beginPath();

		ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);

		ctx.fill();

		ctx.restore();
	}

	update() {
		this.x --;

		this.y --;

		this.alpha -= 0.02;
	}
}

class Bullet {
	constructor(x, y, dirX, dirY, damage, w = 10, h = 5) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.dirX = dirX;
		this.dirY = dirY;
		this.damage = damage;
	}

	draw() {
		ctx.save();

		ctx.fillStyle = "black";

		ctx.fillRect(this.x, this.y, this.w, this.h);

		ctx.restore();
	}

	update() {
		this.x += 10 * this.dirX;
		this.y += 10 * this.dirY;
	}
}

class Bomb extends Bullet {
	constructor(x, y) {
		super(x, y, 0, 1, 25, assets.images.bomb.width / 10, assets.images.bomb.height / 10);
	}

	draw() {
		ctx.drawImage(assets.images.bomb, this.x, this.y, this.w, this.h);
	}
}

class Particle {
	constructor(x, y, color, dir) {
		this.x = x;
		this.y = y;

		const size = Math.floor(random(8, 10));

		this.w = size;
		this.h = size;

		this.ang = 0;

		this.color = color;

		this.xVel = random(-5, 5);
		this.yVel = 0;
	}

	draw() {
		this.ang += this.yVel;

		ctx.save();

		ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
		ctx.rotate(Math.PI / 180 * this.ang);

		ctx.fillStyle = this.color;

		ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

		ctx.restore();
	}

	update() {
		this.x += this.xVel;
		this.y += this.yVel;

		this.yVel += 0.5;
	}
}

class Player {
	constructor() {
		this.x = 0;
		this.y = canvas.height / 2;
		this.w = assets.images.player.width / 2;
		this.h = assets.images.player.height / 2;
		this.damage = 5;
		this.fireRate = 60;
		this.speed = 2;
		this.maxHealth = 100;
		this.health = this.maxHealth;
		this.load = 0;
		this.smokeTimer = 0;
	}

	draw() {
		ctx.drawImage(assets.images.player, this.x, this.y, this.w, this.h);
	}

	update() {
		if(this.health > 0) {
			if(enemies.length === 0 && curWave >= waves.length - 1) {
				this.x ++;
			}else {
				if(keys["d"]) {
					this.x += this.speed;
				}

				if(keys["a"]) {
					this.x -= this.speed;
				}

				if(keys["s"]) {
					this.y += this.speed;
				}

				if(keys["w"]) {
					this.y -= this.speed;
				}

				this.x = this.x < 0 ? 0 : this.x + this.w > canvas.width / 1.5 ? canvas.width / 1.5 - this.w : this.x;
				this.y = this.y < 0 ? 0 : this.y + this.h > canvas.height ? canvas.height - this.h : this.y;

				if(keys[" "] && this.load <= 0) {
					assets.audio.shot.play(0.4);

					playerBullets.push(new Bullet(this.x + this.w, this.y + this.h / 2 - 5, 1, 0, this.damage));

					this.load = this.fireRate;
				}

				for(let i = enemyBullets.length - 1; i >= 0; i --) {
					const bullet = enemyBullets[i];

					if(collide(this, bullet) && this.health > 0) {
						this.health -= bullet.damage;

						this.health = this.health < 0 ? 0 : this.health;

						assets.audio.hit.play(0.8);

						for(let i = 0; i < 3; i ++) {
							particles.push(new Particle(bullet.x, bullet.y, "rgb(0, 53, 105)"));
						}

						enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
					}
				}

				this.load --;
			}
		}else {
			if(this.y > 0) {
				this.x += 3;
				this.y += 2;
			}

			if(this.y > canvas.height) {
				this.y = -1000;

				assets.audio.crash.play(0.2);

				camShakes.push(new CameraShake(10, 20));
			}
		}
		if(this.health <= this.maxHealth / 2) {
			if(this.smokeTimer <= 0) {
				this.smokeTimer = 8;

				smokes.push(new Smoke(this.x + this.w - 15 + random(-5, 5), this.y, random(10, 20)));
			}
		}
		
		this.smokeTimer --;
	}
}

class Enemy {
	constructor(x, y, w, h, health, damage, loadTime, speed, image) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.image = image;
		this.maxHealth = health;
		this.health = health;
		this.damage = damage;
		this.loadTime = loadTime;
		this.load = 0;
		this.speed = speed;
		this.smokeTimer = 0;
		this.dir = -1;
	}

	draw() {
		ctx.save();

		ctx.drawImage(this.image, this.x, this.y, this.w, this.h);

		if(this.health > 0) {
			ctx.fillStyle = "grey";
			ctx.globalAlpha = 0.5;
			ctx.fillRect(this.x + this.w / 2 - 50, this.y - 15, 100, 8);

			ctx.fillStyle = "green";
			ctx.globalAlpha = 1;
			ctx.fillRect(this.x + this.w / 2 - 50, this.y - 15, this.health / this.maxHealth * 100, 8);
		}

		ctx.restore();
	}

	update() {
		if(this.health > 0) {
			if(this.x <= canvas.width - this.w) {
				this.y += this.dir * this.speed;

				if(this.ai) {
					this.ai();
				}
			}else {
				this.x -= this.speed;
			}

			if(this.y < 0 || this.y + this.h > canvas.height) {
				this.dir *= -1;
			}

			if(this.load <= 0 && this.x <= canvas.width) {
				assets.audio.shot.play(0.4);

				enemyBullets.push(new Bullet(this.x, this.y + this.h / 2, -1, 0, this.damage));

				this.load = this.loadTime;
			}

			for(let i = playerBullets.length - 1; i >= 0; i --) {
				const bullet = playerBullets[i];

				if(collide(this, bullet)) {
					this.health -= bullet.damage;

					assets.audio.hit.play(0.8);

					for(let i = 0; i < 3; i ++) {
						particles.push(new Particle(bullet.x, bullet.y, this instanceof EasyBoss ? "rgb(82, 85, 42)" : this instanceof BombBoss ? "rgb(160, 153, 126)" : this instanceof FinalBoss ? "rgb(125, 125, 131)" : "red"));
					}

					playerBullets.splice(playerBullets.indexOf(bullet), 1);
				}
			}

			this.load --;
		}else {
			this.x -= 3;
			this.y += 2;
		}

		if(this.health <= this.maxHealth / 2) {
			if(this.smokeTimer <= 0) {
				this.smokeTimer = 8;

				smokes.push(new Smoke(this.x + 15 + random(-5, 5), this.y, random(10, 20)));
			}
		}

		this.smokeTimer --;
	}
}

class Easy extends Enemy {
	constructor(x, y) {
		super(x, y, assets.images.enemy.width / 2, assets.images.enemy.height / 2, 20, 5, 60, 2, assets.images.enemy);
	}
}

class Small extends Enemy {
	constructor(x, y) {
		super(x, y, assets.images.enemy.width / 3, assets.images.enemy.height / 3, 10, 6, 45, 3, assets.images.enemy);
	}
}

class EasyBoss extends Enemy {
	constructor(x, y) {
		super(x, y, assets.images.easyBoss.width / 2, assets.images.easyBoss.height / 2, 400, 6, 50, 1.5, assets.images.easyBoss);

		this.enemyTimer = 400;
	}

	ai() {
		if(this.enemyTimer <= 0) {
			enemies.push(new Easy(canvas.width - assets.images.enemy.width / 2, this.y));

			this.enemyTimer = 400;
		}

		this.enemyTimer --;
	}
}

class BombBoss extends Enemy {
	constructor(x, y) {
		super(x, y, assets.images.bombBoss.width / 2, assets.images.bombBoss.height / 2, 600, 10, 80, 2, assets.images.bombBoss);

		this.enemyTimer = 300;

		this.bombingTimer = 0;

		this.goingUp = false;

		this.goingDown = false;

		this.actualSpeed = this.speed;
	}

	ai() {
		if(this.bombingTimer <= 0) {
			this.bombingTimer = 840;

			this.goingUp = true;
		}

		if(this.goingUp) {
			this.speed = 0;

			this.load = Infinity;

			if(this.y + this.h <= 0) {
				for(let i = 0; i < canvas.width; i += (canvas.width - assets.images.bomb.width / 10) / 3) {
					enemyBullets.push(new Bomb(i, -1000));
				}

				this.goingUp = false;

				setTimeout(() => {
					this.goingDown = true;
				}, 2000);
			}else {
				this.y -= this.actualSpeed + 1;
			}
		}else if(this.goingDown) {
			if(this.y <= 0) {
				this.y += this.actualSpeed;
			}else {
				this.goingDown = false;

				this.dir = 1;

				this.speed = this.actualSpeed;

				this.load = this.loadTime;
			}
		}

		if(this.enemyTimer <= 0 && this.y >= 0) {
			enemies.push(new Small(canvas.width - assets.images.enemy.width / 3, this.y));

			this.enemyTimer = 440;
		}

		this.enemyTimer --;
		if(this.y >= 0) {
			this.bombingTimer --;
		}
	}
}

class FinalBoss extends Enemy {
	constructor(x, y) {
		super(x, y, assets.images.finalBoss.width / 2, assets.images.finalBoss.height / 2, 1000, 15, 40, 1.5, assets.images.finalBoss);

		this.enemyTimer = 300;

		this.bulletStormDone = false;
	}

	ai() {
		if(this.health <= this.maxHealth / 2 && !this.bulletStormDone) {
			const bulletStormMap = [
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------                                   -------------------------------",
				"--------------                                   -------------------------------",
				"-------                                                 ------------------------",
				"-------                                                 ------------------------",
				"-------                                                 ------------------------",
				"                                                               -----------------",
				"                                                               -----------------",
				"                                                               -----------------",
				"                                                                                ",
				"                        ---------------                                         ",
				"                        ---------------                                         ",//50
				"                        ---------------                                         ",
				"                 -----------------------------                                  ",
				"                 -----------------------------                                  ",
				"                 -----------------------------                                  ",
				"-----------------------------------------------------                           ",
				"-----------------------------------------------------                           ",
				"-----------------------------------------------------                           ",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------",
				"--------------------------------------------------------------------------------"
			];

			for(let row in bulletStormMap) {
				for(let col in bulletStormMap[row]) {
					const letter = bulletStormMap[row][col];

					if(letter === "-") {
						const bulletToPush = new Bullet(canvas.width + 50 + 20 * col, 10 * row, -0.2, 0, 5);

						bulletToPush.isBulletStorm = true;

						enemyBullets.push(bulletToPush);
					}
				}
			}

			this.bulletStormDone = true;
		}

		if(this.enemyTimer <= 0) {
			enemies.push(new Easy(canvas.width - assets.images.enemy.width / 2, this.y));
			enemies.push(new Small(canvas.width - assets.images.enemy.width / 3, this.y));

			this.enemyTimer = 410;
		}

		this.enemyTimer --;
	}
}

const frontClouds = [], backClouds = [], alerts = [], particles = [], camShakes = [];

let player, enemies = [], smokes = [], canvasImage, upgradeOptions, deathAlpha = 0;

for(let i = 0; i < 10; i ++) {
	frontClouds.push(new Cloud(random(-canvas.width / 2, canvas.width), random(0, canvas.height)));
}

for(let i = 0; i < 10; i ++) {
	backClouds.push(new Cloud(random(-canvas.width / 2, canvas.width), random(0, canvas.height)));
}

function init() {
	upgrades = [
		{
			name: "Damage",
			desc: "Player damage increased by 2",
			icon: assets.images.damage,
			times: 3,
			onBuy: () => {
				player.damage += 2;
			}
		},
		{
			name: "Fire Rate",
			desc: "Player fire rate decreased by 10",
			icon: assets.images.reload,
			times: 3,
			onBuy: () => {
				player.fireRate -= 10;
			}
		},
		{
			name: "Health",
			desc: "Player max health increased by 100",
			icon: assets.images.health,
			times: 3,
			onBuy: () => {
				const percentOfMax = player.health / player.maxHealth;

				player.maxHealth += 100;

				player.health = Math.round(percentOfMax * player.maxHealth);
			}
		}
	];

	player = new Player();
}

//Menu buttons and health button
const playButton = new Button(canvas.width / 2 - 150, canvas.height / 2 - 37.5, 300, 75, curAm => {
	return curAm + (300 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	const width = animTimer;

	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, width, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Play", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();

	assets.audio.music.play(0.8, true);

	player = new Player();

	enemies = [];

	enemyBullets = [];
	playerBullets = [];

	smokes = [];

	curWave = -1;

	scene = "game";
}), creditsButton = new Button(canvas.width / 2 - 150, 600 - 37.5, 300, 75, curAm => {
	return curAm + (300 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, animTimer, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Credits", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();
	
	assets.audio.music.play(0.8, true);

	scene = "credits";
}), backButton = new Button(20, 20, 200, 50, curAm => {
	return curAm + (200 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, animTimer, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Back", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();

	assets.audio.music.stop();

	credits.y = 0;

	scene = "menu";
}), okButton = new Button(400, 600, 200, 50, curAm => {
	return curAm + (200 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, animTimer, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Okay", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();
	
	localStorage.setItem("tutorialDone", "true");

	scene = "game";
}), healthButton = new Button(400, 625, 200, 150, curAm => {
	return curAm + (0.1 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.translate(x - animTimer * w / 2, y - animTimer * h / 2);

	ctx.scale(animTimer + 1, animTimer + 1);

	ctx.fillStyle = "tan";

	ctx.globalAlpha = 1;

	ctx.fillRect(0, 0, w, h);

	ctx.fillStyle = "black";

	ctx.strokeRect(0, 0, w, h);

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";

	ctx.fillText("Full health restore", w / 2, 30);

	ctx.drawImage(assets.images.heal, w / 2 - assets.images.heal.width / 4, 50, assets.images.heal.width / 2, assets.images.heal.height / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();
	
	player.health = player.maxHealth;

	scene = "game";
}), playAgainButton = new Button(200, canvas.height / 2 - 37.5, 300, 75, curAm => {
	return curAm + (300 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, animTimer, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Play Again", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();

	player = new Player();

	enemies = [];

	enemyBullets = [];
	playerBullets = [];

	smokes = [];

	curWave = -1;

	scene = "game";
}), menuButton = new Button(550, canvas.height / 2 - 37.5, 300, 75, curAm => {
	return curAm + (300 - curAm) * 0.1;
}, curAm => {
	return curAm - curAm * 0.1;
}, (x, y, w, h, animTimer) => {
	ctx.save();

	ctx.fillStyle = "grey";

	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = "black";

	ctx.fillRect(x, y, animTimer, h);

	const color = animTimer / w * 255;

	ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;

	ctx.font = "20px Sans-Serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.fillText("Menu", x + w / 2, y + h / 2);

	ctx.restore();
}, () => {
	assets.audio.click.play();

	assets.audio.music.stop();

	scene = "menu";
});

const tips = ["Sometimes dodging is more important than hitting your targets", "Don't get too greedy with upgrades; take a health restore when you need it", "Focus on the enemies that bosses spawn so as not to get overwhelmed", "Damage and fire rate are good upgrades to get early"];

let curTip;

//Upgrade buttons
let upgradeButtons = [];

const credits = new Credits();

//Game loop
function loop() {
	switch (scene) {
		case "menu":
			ctx.save();

			ctx.fillStyle = "skyblue";

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for(let i = backClouds.length - 1; i >= 0; i --) {
				const cloud = backClouds[i];

				cloud.draw();
				cloud.update();

				if(cloud.x + 130 < 0) {
					backClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			for(let i = frontClouds.length - 1; i >= 0; i --) {
				const cloud = frontClouds[i];

				cloud.draw();
				cloud.update();

				if(cloud.x + 130 < 0) {
					frontClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			ctx.fillStyle = "black";

			ctx.font = "100px Sans-Serif";
			ctx.textAlign = "center";

			ctx.fillText("Plane Game", canvas.width / 2, 120);

			ctx.drawImage(assets.images.player, canvas.width / 2 - assets.images.player.width, 160, assets.images.player.width * 2, assets.images.player.height * 2);

			playButton.draw();
			playButton.update();

			creditsButton.draw();
			creditsButton.update();

			ctx.restore();
			break;
		case "credits":
			ctx.fillStyle = "skyblue";

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for(let i = backClouds.length - 1; i >= 0; i --) {
				const cloud = backClouds[i];

				cloud.draw();
				cloud.update();

				if(cloud.x + 130 < 0) {
					backClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			for(let i = frontClouds.length - 1; i >= 0; i --) {
				const cloud = frontClouds[i];

				cloud.draw();
				cloud.update();

				if(cloud.x + 130 < 0) {
					frontClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			backButton.draw();
			backButton.update();

			credits.draw();
			credits.update();

			break;
		case "game":
			ctx.save();

			ctx.fillStyle = "skyblue";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for(let i = camShakes.length - 1; i >= 0; i --) {
				const camShake = camShakes[i];

				camShake.update();

				if(camShake.duration <= 0) {
					camShakes.splice(i, 1);
				}
			}

			for(let i = backClouds.length - 1; i >= 0; i --) {
				const cloud = backClouds[i];

				cloud.update();
				cloud.draw();


				if(cloud.x + 130 < 0) {
					backClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			ctx.save();

			ctx.fillStyle = "grey";
			ctx.globalAlpha = 0.5;

			ctx.fillRect(30, canvas.height - 60, 400, 30);

			ctx.globalAlpha = 0.8;

			ctx.fillRect(30, canvas.height - 60, player.load <= 0 ? 400 : 400 - player.load / player.fireRate * 400, 30);

			ctx.globalAlpha = 0.5;

			ctx.fillRect(30, 30, 400, 30);

			ctx.fillStyle = "red";
			ctx.globalAlpha = 1;

			ctx.fillRect(30, 30, player.health / player.maxHealth * 400, 30);

			ctx.fillStyle = "black";

			ctx.font = "20px Sans-Serif";
			ctx.textAlign = "center";

			ctx.fillText(`${player.health}/${player.maxHealth}`, 230, 52);

			ctx.restore();

			for(let i = playerBullets.length - 1; i >= 0; i --) {
				const bullet = playerBullets[i];

				bullet.draw();
				bullet.update();

				if(bullet.x + bullet.w < 0 || bullet.x > canvas.width) {
					playerBullets.splice(playerBullets.indexOf(bullet), 1);
				}
			}

			for(let i = enemyBullets.length - 1; i >= 0; i --) {
				const bullet = enemyBullets[i];

				bullet.draw();
				bullet.update();

				if((bullet.x + bullet.w < 0 || bullet.x > canvas.width || bullet.y > canvas.height) && !bullet.isBulletStorm) {
					if(bullet instanceof Bomb) {
						assets.audio.crash.play(0.2);

						camShakes.push(new CameraShake(10, 20));
					}

					enemyBullets.splice(i, 1);
				}
			}

			for(let i = enemies.length - 1; i >= 0; i --) {
				let enemy = enemies[i];

				enemy.draw();
				enemy.update();

				if(enemy.y > canvas.height && enemy.health <= 0) {
					if(enemy instanceof EasyBoss || enemy instanceof BombBoss || enemy instanceof FinalBoss) {
						assets.audio.bossCrash.play(1.3);

						camShakes.push(new CameraShake(15, 250));
					}else {
						assets.audio.crash.play(0.2);

						camShakes.push(new CameraShake(10, 20));
					}

					enemies.splice(i, 1);
				}
			}

			player.draw();
			player.update();

			for(let i = particles.length - 1; i >= 0; i --) {
				const particle = particles[i];

				particle.draw();
				particle.update();

				if(particle.y > canvas.height) {
					particles.splice(i, 1);
				}
			}

			for(let i = frontClouds.length - 1; i >= 0; i --) {
				const cloud = frontClouds[i];

				cloud.draw();
				cloud.update();

				if(cloud.x + 130 < 0) {
					frontClouds.splice(i, 1, new Cloud(canvas.width + 300, random(0, canvas.height)));
				}
			}

			for(let i = smokes.length - 1; i >= 0; i --) {
				const smoke = smokes[i];

				smoke.draw();
				smoke.update();

				if(smoke.alpha <= 0) {
					smokes.splice(i, 1);
				}
			}

			for(let i = alerts.length - 1; i >= 0; i --) {
				const alert = alerts[i];

				alert.draw();
				alert.update();

				if(alert.alpha <= 0) {
					alerts.splice(i, 1);
				}
			}

			if(enemies.length === 0 && camShakes.length === 0) {
				if(curWave < waves.length - 1) {
					if(curWave >= 0) {
						if(waves[curWave].includes("a") || waves[curWave].includes("b") || waves[curWave].includes("f")) {
							player.health = player.maxHealth;
						}
					}

					curWave ++;

					alerts.push(new Alert(`Wave ${curWave + 1}`));

					if(curWave !== 0) {
						canvasImage = toImage(canvas);

						upgradeOptions = [
							upgrades[Math.floor(random(0, upgrades.length))],
							upgrades[Math.floor(random(0, upgrades.length))],
							upgrades[Math.floor(random(0, upgrades.length))]
						];

						for(let i in upgradeOptions) {
							upgradeButtons.push(new Button(i * 300 + 100, 250, 200, 300, curAm => {
								return curAm + (0.1 - curAm) * 0.1;
							}, curAm => {
								return curAm - curAm * 0.1;
							}, (x, y, w, h, animTimer) => {
								ctx.save();

								ctx.translate(x - animTimer * w / 2, y - animTimer * h / 2);
							
								ctx.scale(animTimer + 1, animTimer + 1);

								ctx.fillStyle = "tan";

								ctx.globalAlpha = 1;

								ctx.fillRect(0, 0, w, h);

								ctx.fillStyle = "black";

								ctx.strokeRect(0, 0, w, h);

								ctx.font = "20px Sans-Serif";
								ctx.textAlign = "center";

								ctx.fillText(upgradeOptions[i].name, w / 2, 25);

								ctx.drawImage(upgradeOptions[i].icon, w / 2 - upgradeOptions[i].icon.width / 4, 38, upgradeOptions[i].icon.width / 2, upgradeOptions[i].icon.height / 2);

								const splitStr = upgradeOptions[i].desc.split(" ");

								const firstPart = splitStr.slice(0, Math.round((splitStr.length - 1) / 2)).join(" "), secondPart = splitStr.slice(Math.round((splitStr.length - 1) / 2)).join(" ");

								ctx.fillText(firstPart, w / 2, 125);

								ctx.fillText(secondPart, w / 2, 145);

								ctx.restore();
							}, () => {
								assets.audio.click.play();

								upgradeOptions[i].onBuy();

								upgradeOptions[i].times --;

								if(upgradeOptions[i].times <= 0) {
									upgrades.splice(upgrades.indexOf(upgradeOptions[i]), 1);
								}

								upgradeButtons = [];

								scene = "game";
							}));
						}

						scene = "upgrade";
					}

					let curX = 0;

					for(let i in waves[curWave]) {
						let enemyToPush;

						const x = curX + canvas.width + 300 + i * 20, y = canvas.width / 2;

						switch (waves[curWave][i]) {
							case "e":
								enemyToPush = new Easy(x, y);
								break;
							case "s":
								enemyToPush = new Small(x, y);
								break;
							case "a":
								enemyToPush = new EasyBoss(x, y);
								break;
							case "b":
								enemyToPush = new BombBoss(x, y);
								break;
							case "f":
								enemyToPush = new FinalBoss(x, y);
								break;
						}

						curX += enemyToPush.w;

						enemies.push(enemyToPush);
					}
				}else {
					if(camShakes.length === 0) {
						credits.draw();
						credits.update();

						if(credits.done) {
							assets.audio.music.stop();

							curWave = -1;

							credits.y = 0;

							scene = "menu";
						}
					}
				}
			}

			if(camShakes.length === 0 && player.y < 0) {
				canvasImage = toImage(canvas);

				deathAlpha = 0;

				curTip = Math.floor(random(0, tips.length));

				scene = "death";
			}

			if(!localStorage.getItem("tutorialDone")) {
				canvasImage = toImage(canvas);
				
				scene = "tutorial";
			}

			ctx.restore();

			break;
		case "tutorial":
			ctx.save();
			
			ctx.drawImage(canvasImage, 0, 0);

			ctx.fillStyle = "grey";
			ctx.globalAlpha = 0.5;

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "tan";
			ctx.globalAlpha = 1;

			ctx.fillRect(250, 250, 500, 500);

			ctx.strokeRect(250, 250, 500, 500);

			ctx.fillStyle = "black";
			ctx.font = "20px sans-serif";

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText("WASD keys to move", 500, 300);

			ctx.fillText("Spacebar to shoot", 500, 380);

			ctx.fillText("Shoot down the enemy planes to win", 500, 460);

			ctx.fillText("Good luck!", 500, 540);

			okButton.draw();
			okButton.update();

			ctx.restore();
			break;
		case "upgrade":
			ctx.save();

			ctx.drawImage(canvasImage, 0, 0);

			ctx.fillStyle = "grey";
			ctx.globalAlpha = 0.5;

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = "50px Sans-Serif";
			ctx.textAlign = "center";

			ctx.fillStyle = "black";
			ctx.globalAlpha = 1;

			ctx.fillText("Choose an upgrade", canvas.width / 2, 200);

			if(!(waves[curWave - 1].includes("a") || waves[curWave - 1].includes("b") || waves[curWave - 1].includes("f"))) {
				ctx.fillText("or", canvas.width / 2, 600);

				healthButton.draw();
				healthButton.update();
			}

			for(let button of upgradeButtons) {
				button.draw();
				button.update();
			}

			ctx.restore();
			break;
		case "death":
			ctx.save();

			ctx.drawImage(canvasImage, 0, 0);

			ctx.fillStyle = "red";

			ctx.globalAlpha = deathAlpha;

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "black";

			ctx.globalAlpha = Math.min(1, deathAlpha * 2);

			ctx.font = "80px Sans-Serif";

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText("You died", canvas.width / 2, 100);

			playAgainButton.draw();
			playAgainButton.update();

			menuButton.draw();
			menuButton.update();

			ctx.font = "25px sans-serif";

			ctx.fillText("Tip:", canvas.width / 2, 700);
			ctx.fillText(tips[curTip], canvas.width / 2, 740);

			ctx.restore();

			if(deathAlpha < 0.5) {
				deathAlpha += 0.002;
			}

			break;
	}

	mouse.click = false;
	mouse.press = false;
}

//All of our assets
const assets = {
	images: {
		player: "player",
		enemy: "enemy",
		easyBoss: "easy_boss",
		bombBoss: "bomb_boss",
		finalBoss: "final_boss",
		bomb: "bomb",
		speed: "speed",
		health: "health",
		reload: "reload",
		damage: "damage",
		heal: "heal"
	},
	audio: {
		click: "click",
		music: "music",
		shot: "shot",
		hit: "hit",
		crash: "crash",
		bossCrash: "boss_crash"
	}
};

//Function to load an image
function createSprite(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.onload = () => {
			resolve(image);
		};

		image.src = url;
	});
}

//Function to load an audio file
function createAudio(url) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();

		request.open("GET", url);

		request.responseType = "arraybuffer";

		request.onload = () => {
			audioCtx.decodeAudioData(request.response, buffer => {
				resolve(new Sound(buffer));
			}, error => {
				console.error(error);
			});
		};

		request.send();
	});
}

//Replace all the urls with promises
for(let i in assets.images) {
	assets.images[i] = createSprite(`assets/images/${assets.images[i]}.png`);
}

for(let i in assets.audio) {
	assets.audio[i] = createAudio(`assets/audio/${assets.audio[i]}.mp3`);
}

//Get the sprites and then start the game loop

/*
This is kind of a mess, so let me explain a bit more

Promise.all will take an array of promises, and return a new promise that fires when all of those promises have been resolved. So here, we're just waiting until all of the sprites have been fetched, but since assets does not just have the promises in them (it has two objects that themselves have the promises in them) we need to use Promise.all to make a single promise for when the images are fetched, and Promise.all to make a single promise for when the audio is fetched, and then use Promise.all yet again to fire only when both of those are done.
*/
Promise.all([
	Promise.all(Object.values(assets.images)),
	Promise.all(Object.values(assets.audio))
]).then(values => {
	//Next, we need to replace the promises in assets with the actual images and audio
	//Loop through assets
	for(let i in assets) {
		//Since values is a 2D array, like this: [[images], [audio]] we need to loop through that as well. To do this, we just ket the keys of assets (images and audio) and see what index that is (0 or 1).
		let j = Object.keys(assets).indexOf(i);
		//Loop through the objects inside assets (images and audio)
		for(let k in assets[i]) {
			/*
			First, we use j to decide whether it is images or audio we are dealing with, then we use the same tactic to get the specific image or audio. We can do this because we know that the array is in the same order as the object, for example:
			[[image, image, image], [audio, audio, audio]]
			{
				images: {
					someImage: image,
					someImageTwo: image,
					someImageThree: image
				},
				audio: {
					someAudio: audio,
					someAudioTwo: audio,
					someAudioThree: audio
				}
			}
			*/
			let value = values[j][Object.keys(assets[i]).indexOf(k)];
			//Finally, replace the promise with the actual image/audio
			assets[i][k] = value;
		}
	}

	/*
	A simplified version of this loop that uses 2 loops instead of a nested loop would be:
	for(let i in assets.images) {
		assets.images[i] = values[0][Object.keys(assets.images).indexOf(i)];
	}

	for(let i in assets.audio) {
		assets.audio[i] = values[1][Object.keys(assets.audio).indexOf(i)];
	}

	It's definetly easier to read, but it's better to use a nested loop so that we don't have to repeat code
	*/

	//Remove the loading scene
	const loadingElements = document.getElementsByClassName("loading");

	for(let i = loadingElements.length - 1; i >= 0; i --) {
		loadingElements[i].remove();
	}

	//And start the game loop
	init();

	setInterval(loop, 1000 / 60);
});