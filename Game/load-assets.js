const assets = {
	images: {
		base: "base",
		worker: "worker"
	},
	audio: {
	}
};

function createImage(url) {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.onload = () => {
			resolve(image);
		};

		image.src = url;
	});
}

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

for(let i in assets.images) {
	assets.images[i] = createImage(`assets/images/${assets.images[i]}.png`);
}

for(let i in assets.audio) {
	assets.audio[i] = createAudio(`assets/audio/${assets.audio[i]}.mp3`);
}

Promise.all([
	Promise.all(Object.values(assets.images)),
	Promise.all(Object.values(assets.audio))
]).then(values => {
	for(let i in assets) {
		let j = Object.keys(assets).indexOf(i);
		
		for(let k in assets[i]) {
			let value = values[j][Object.keys(assets[i]).indexOf(k)];
			
			assets[i][k] = value;
		}
	}
});