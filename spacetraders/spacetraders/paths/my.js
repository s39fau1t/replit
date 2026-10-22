import Path from "./path.js";

//TODO: Structures and on
export default class My extends Path {
	async account() {
		return (await this.user.sendRequest("GET", "my/account")).user;
	}

	async flightPlan(id) {
		return (await this.user.sendRequest("GET", `my/flight-plans/${id}`)).flightPlan;
	}

	async newFlightPlan(shipId, destination) {
		return (await this.user.sendRequest("POST", "my/flight-plans", `shipId=${shipId}&destination=${destination}`)).flightPlan;
	}

	async loans() {
		return (await this.user.sendRequest("GET", "my/loans")).loans;
	}

	async payOffLoan(id) {
		return await this.user.sendRequest("PUT", `my/loans/${id}`);
	}

	async newLoan(type) {
		return await this.user.sendRequest("POST", "my/loans", `type=${type}`);
	}

	async newPurchaseOrder(shipId, good, quantity) {
		return await this.user.sendRequest("POST", "my/purchase-orders", `shipId=${shipId}&good=${good}&quantity=${quantity}`);
	}

	async newSellOrder(shipId, good, quantity) {
		return await this.user.sendRequest("POST", "my/sell-orders", `shipId=${shipId}&good=${good}&quantity=${quantity}`);
	}

	async purchaseShip(location, type) {
		return await this.user.sendRequest("POST", "my/ships", `location=${location}&type=${type}`);
	}

	async ship(id) {
		return (await this.user.sendRequest("GET", `my/ships/${id}`)).ship;
	}

	async ships() {
		return (await this.user.sendRequest("GET", "my/ships")).ships;
	}

	async jettisonCargo(shipId, good, quantity) {
		return (await this.user.sendRequest("POST", `my/ships/${shipId}/jettison`, `good=${good}&quantity=${quantity}`));
	}

	//FIXME: Maybe don't return the property here
	async scrapShip(id) {
		return (await this.user.sendRequest("DELETE", `my/ships/${id}`)).success;
	}

	async transferCargo(fromId, toId, good, quantity) {
		return (await this.user.sendRequest("POST", `my/ships/${fromId}/transfer`, `toShipId=${toId}&good=${good}&quantity=${quantity}`));
	}
}