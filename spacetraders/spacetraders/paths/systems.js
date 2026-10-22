import Path from "./path.js";

export default class Systems extends Path {
	async shipListings(system, shipClass = "") {
		return (await this.user.sendRequest("GET", `systems/${system}/ship-listings`, `class=${shipClass}`)).shipListings;
	}

	async flightPlans(system) {
		return (await this.user.sendRequest("GET", `systems/${system}/flight-plans`)).flightPlans;
	}

	async ships(system) {
		return (await this.user.sendRequest("GET", `systems/${system}/ships`)).ships;
	}

	async locations(system, type = "") {
		return (await this.user.sendRequest("GET", `systems/${system}/locations`, `type=${type}`)).locations;
	}

	async info(system) {
		return (await this.user.sendRequest("GET", `systems/${system}`)).system;
	}
}