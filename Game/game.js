const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

window.onresize = () => {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
};

canvas.oncontextmenu = event => {
	event.preventDefault();
};

const mouse = {x: 0, y: 0, down: false, click: false, press: false, button: 0}, keys = {};

canvas.onkeydown = event => {
	keys[event.key] = true;
};

canvas.onkeyup = event => {
	keys[event.key] = false;
};

canvas.onmousemove = event => {
	mouse.x = event.clientX;
	mouse.y = event.clientY;
};

canvas.onmousedown = event => {
	mouse.down = true;
	mouse.press = true;

	mouse.button = event.button;
};

canvas.onmouseup = () => {
	mouse.down = false;

	mouse.click = true;
};

function random(min, max) {
	return Math.random() * (max - min) + min;
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

class Camera {
	constructor(startX, startY) {
		this.x = startX;
		this.y = startY;

		this.oldX = 0;
		this.oldY = 0;

		this.dragStart = {x: 0, y: 0};
	}

	update() {
		if(mouse.press && mouse.button === 2) {
			this.dragStart.x = mouse.x;
			this.dragStart.y = mouse.y;
		}
		
		if(mouse.down && mouse.button === 2) {
			this.x = this.oldX + (mouse.x - this.dragStart.x) * 1;
			this.y = this.oldY + (mouse.y - this.dragStart.y) * 1;

			canvas.style.cursor = "grabbing";
		}else {
			this.oldX = this.x;
			this.oldY = this.y;

			canvas.style.cursor = "";
		}
	}
}

class SelectHandler {
	constructor() {
		this.x1 = 0;
		this.y1 = 0;

		this.x2 = 0;
		this.y2 = 0;

		this.selecting = false;
	}
	
	update() {
		if(mouse.press && mouse.button === 0 && !(keys["Shift"] && selectedUnits.length > 0)) {
			//Clear selectedUnits and start selecting
			selectedUnits.splice(0);
			
			this.x1 = mouse.x;
			this.y1 = mouse.y;
	
			this.selecting = true;
		}

		if(this.selecting) {
			this.x2 = mouse.x;
			this.y2 = mouse.y;

			if(mouse.click) {
				//Select all units in range
				for(let unit of units) {
					//Simply collide the select box with the unit (factor in cam to get actual position on canvas)
					if(unit.x + cam.x + unit.image.width > this.x1 && unit.y + cam.y + unit.image.height > this.y1 && unit.x + cam.x < this.x2 && unit.y + cam.y < this.y2) {
						selectedUnits.push(unit);
					}
				}
		
				this.selecting = false;
			}
		}
	}

	draw() {
		ctx.save();

		//If selecting, draw box
		if(this.selecting) {
			ctx.fillStyle = "rgb(200, 200, 200)";
			ctx.globalAlpha = 0.5;
	
			ctx.fillRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
		}
		
		ctx.restore();
	}
}

class Building {
	constructor(x, y, image, id) {
		this.x = x;
		this.y = y;

		this.id = id;

		this.image = image;
	}

	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}
}

//Same as Building but add interpolation functionality
class Unit {
	constructor(x, y, image, id) {
		this.x = x;
		this.y = y;

		this.image = image;

		this.id = id;

		this.positions = [];
	}

	update() {
		const time = performance.now() - 100;

		while(this.positions.length >= 2 && this.positions[1].time <= time) {
			this.positions.shift();
		}

		if(this.positions.length >= 2 && this.positions[0].time <= time && this.positions[1].time >= time) {
			const firstPosition = this.positions[0];
			const secondPosition = this.positions[1];
			
			this.x = firstPosition.x + (secondPosition.x - firstPosition.x) * (time - firstPosition.time) / (secondPosition.time - firstPosition.time);
			this.y = firstPosition.y + (secondPosition.y - firstPosition.y) * (time - firstPosition.time) / (secondPosition.time - firstPosition.time);
		}
	}

	draw() {
		ctx.save();

		//If this unit is selected, draw a circle around/under? it
		ctx.fillStyle = "rgb(200, 200, 200)";

		ctx.globalAlpha = 0.5;

		for(let unit of selectedUnits) {
			ctx.beginPath();
			
			ctx.arc(unit.x + unit.image.width / 2, unit.y + unit.image.height / 2, unit.image.width > unit.image.height ? unit.image.width / 2 + 2 : unit.image.height / 2 + 2, 0, Math.PI * 2);
			
			ctx.fill();
		}

		ctx.globalAlpha = 1;

		//Draw the unit
		ctx.drawImage(this.image, this.x, this.y);

		ctx.restore();
	}
}

function inGame(event) {
	const message = JSON.parse(event.data);

	switch(message.type) {
		case "chat":
			addToChat(message.data);
			break;
		case "join":
			addToChat(`${message.data} joined the room`);

			addToPlayers(message.data);
			break;
		case "leave":
			addToChat(`${message.data} left the room`);

			for(let i = 1; i < playersContainer.children.length; i ++) {
				const player = playersContainer.children[i];
				
				if(player.textContent === message.data) {
					player.remove();
					
					break;
				}
			}
			break;
		case "update":
			const existingBuildingIds = buildings.map(building => building.id);

			const sentBuildingIds = message.data.buildings.map(building => building.id);

			for(let i = buildings.length - 1; i >= 0; i --) {
				if(!sentBuildingIds.includes(buildings[i].id)) {
					//Show death animation
					buildings.splice(i, 1);
				}
			}

			for(let building of message.data.buildings) {
				if(!existingBuildingIds.includes(building.id)) {
					//Get type and use appropriate image
					buildings.push(new Building(building.x, building.y, assets.images.base, building.id));
				}
			}
			
			const existingUnitIds = units.map(unit => unit.id);
			
			const sentUnitIds = message.data.units.map(unit => unit.id);

			for(let i = units.length - 1; i >= 0; i --) {
				if(!sentUnitIds.includes(units[i].id)) {
					//Show death animation
					units.splice(i, 1);
				}
			}

			for(let unit of message.data.units) {
				if(!existingUnitIds.includes(unit.id)) {
					//Get type and use appropriate image
					units.push(new Unit(unit.x, unit.y, assets.images.worker, unit.id));

					continue;
				}

				const existingUnit = units[existingUnitIds.indexOf(unit.id)];

				existingUnit.positions.push({time: performance.now(), x: unit.x, y: unit.y});
			}
			break;
	}
}

const buildings = [], units = [], selectedUnits = [];

let cam, selectHandler;

//Make sure to reset all globals
function initGame(message) {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	cam = new Camera(Math.round(message.data.baseX + canvas.width / 2 - assets.images.base.width / 2), Math.round(message.data.baseY + canvas.height / 2 - assets.images.base.height / 2));

	selectHandler = new SelectHandler();

	buildings.push(new Building(message.data.baseX, message.data.baseY, assets.images.base, 0));
}

function loop() {
	ctx.save();

	ctx.fillStyle = "black";

	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	cam.update();
	
	ctx.translate(cam.x, cam.y);

	ctx.fillStyle = "green";
	
	ctx.fillRect(0, 0, 1000, 1000);

	for(let building of buildings) {
		building.draw();
	}

	for(let unit of units) {
		unit.update();
		unit.draw();
	}
	
	ctx.restore();

	//Draw ui!
	selectHandler.update();
	selectHandler.draw();

	if(mouse.click && mouse.button === 0 && keys["Shift"] && selectedUnits.length > 0) {
		webSocket.send(JSON.stringify({type: "move", data: {x: mouse.x - cam.x, y: mouse.y - cam.y, ids: selectedUnits.map(unit => unit.id)}}));
	}

	mouse.press = false;
	mouse.click = false;
}