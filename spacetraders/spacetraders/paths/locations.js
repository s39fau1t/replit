import Path from "./path.js";

export default class Locations extends Path {
	async info(location) {
		return (await this.user.sendRequest("GET", `locations/${location}`)).location;
	}

	async marketplace(location) {
		return (await this.user.sendRequest("GET", `locations/${location}/marketplace`)).marketplace;
	}

	async ships(location) {
		return (await this.user.sendRequest("GET", `locations/${location}/ships`)).ships;
	}
}