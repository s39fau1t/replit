import Path from "./path.js";

export default class Types extends Path {
	async goods() {
		return (await this.user.sendRequest("GET", "types/goods")).goods;
	}

	async loans() {
		return (await this.user.sendRequest("GET", "types/loans")).loans;
	}

	async structures() {
		return (await this.user.sendRequest("GET", "types/structures")).structures;
	}

	async ships(shipClass = "") {
		//Class parameter is listed in documentation but does not work - send a warning message
		if(shipClass) {
			console.warn("Hey! I notice you're trying to use the class paramter for the types/ships endpoint. This parameter is listed in the documentation (https://api.spacetraders.io/#api-types-GetShipsInfo), but it does not work.");
		}
		
		return (await this.user.sendRequest("GET", "types/ships", `class=${shipClass}`)).ships;
	}
}