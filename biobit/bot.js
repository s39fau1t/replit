function wsSend(ws, data) {
	if (!ws) return;
	if (ws.readyState !== 1) return;
	if (data.build) ws.send(data.build());
	else ws.send(data);
}

function sendMouseMove(ws, x, y) {
	var writer = new Writer(true);
	writer.setUint8(0x10);
	writer.setUint32(x);
	writer.setUint32(y);
	writer._b.push(0, 0, 0, 0);
	wsSend(ws, writer);
}

function sendPlay(ws, name) {
	var writer = new Writer(true);
	writer.setUint8(0x00);
	writer.setStringUTF8(name);
	wsSend(ws, writer);
}

function sendChat(ws, text) {
	var writer = new Writer();
	writer.setUint8(0x63);
	writer.setUint8(0);
	writer.setStringUTF8(text);
	wsSend(ws, writer);
}

function bytesToHex(r, g, b) {
	return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

const SEND_254 = new Uint8Array([254, 6, 0, 0, 0]);
const SEND_255 = new Uint8Array([255, 1, 0, 0, 0]);

let xPos = -7000;
let yPos = -7000;

const bots = [];

class Bot {
	constructor(ws, interval) {
		this.ws = ws;
		this.interval = interval;
	}

	destroy() {
		this.ws.close();
		clearInterval(this.interval);
	}
}

function bot(numBots, onopen = () => {}) {
	const ws = new WebSocket("wss://biobit.bigfatgrub.repl.co/");

	ws.binaryType = "arraybuffer";

	let name = `bot${numBots}`;
	
	ws.onopen = () => {
		wsSend(ws, SEND_254);
		wsSend(ws, SEND_255);
	
		sendPlay(ws, name);

		sendMouseMove(ws, xPos, yPos);

		const interval = setInterval(() => {
			sendMouseMove(ws, xPos, yPos);
		}, 40);

		bots.push(new Bot(ws, interval));

		onopen(ws);

		console.log(`${name} spawned`);
		
		if(numBots > 1) {
			console.log(`spawning bot${numBots - 1}`);
			bot(numBots - 1, onopen);
		}
	};

	const cells = {};

	ws.onmessage = data => {
		var reader = new Reader(new DataView(data.data), 0, true);
    var packetId = reader.getUint8();

		switch(packetId) {
			case 0x10:
				let count = reader.getUint16();
				
				for (var i = 0; i < count; i++) {
					let killer = reader.getUint32();
					let killed = reader.getUint32();
					
					if(cells[killed]) {
						delete cells[killed];

						if(Object.keys(cells).length === 0) {
							sendPlay(ws, name);
							sendMouseMove(ws, xPos, yPos);
						}
					}
				}
				
				break;
			case 0x20:
				cells[reader.getUint32()] = true;
				break;
		}
	};
}

function destroyBots() {
	for(let bot of bots) {
		bot.destroy();
	}

	bots.splice(0);
}

console.log(`
setInterval(() => {
    const cell = cells.byId[cells.mine[0]];

    if(cell) {
        xPos = cell.ox;
        yPos = cell.oy;
    }
}, 20);
`);