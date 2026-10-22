import https from "https";

export function sendRequest(method, hostname, path, parameters) {
	return new Promise((resolve, reject) => {
		https.request({
			hostname: hostname,
			path: `/${path}?${parameters}`,
			method: method,
		}, res => {
			resolve(res);
		}).end();
	});
}

export function getData(res) {
	return new Promise((resolve, reject) => {
		let data = "";

		res.on("data", chunk => {
			data += chunk;
		});

		res.on("end", () => {
			resolve(JSON.parse(data));
		});
	});
}

export function waitMs(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}