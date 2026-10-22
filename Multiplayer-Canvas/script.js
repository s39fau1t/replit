const websocket = new WebSocket("wss://Multiplayer-Canvas.danielrichards9.repl.co/");

const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

window.onresize = () => {
	const image = new Image();

	image.onload = () => {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		ctx.drawImage(image, 0, 0);
	};

	image.src = canvas.toDataURL();
};

let mouse = {x: 0, y: 0, down: false};

function loop() {
	if(mouse.down) {
		ctx.fillStyle = "black";
		ctx.fillRect(mouse.x, mouse.y, 2, 2);

		websocket.send(JSON.stringify({x: mouse.x, y: mouse.y}));
	}
};

websocket.onopen = () => {
	canvas.onmousedown = () => {
		mouse.down = true;
	};

	canvas.onmouseup = () => {
		mouse.down = false;
	};

	canvas.onmousemove = event => {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	};

	setInterval(loop, 1000 / 60);
};

websocket.onmessage = event => {
	const message = JSON.parse(event.data);

	ctx.fillStyle = "black";
	ctx.fillRect(message.x, message.y, 2, 2);
};