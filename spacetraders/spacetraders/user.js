import {sendRequest, getData, waitMs} from "./utils.js";

import My from "./paths/my.js";
import Game from "./paths/game.js";
import Types from "./paths/types.js";
import Systems from "./paths/systems.js";
import Locations from "./paths/locations.js";

//TODO: Maybe add caching in the future instead of using getters

//TODO: Add objects for the top level api routes, e.g. my, game, locations

//TODO: Add error handling

export default class User {
	constructor(token) {
		this.token = token;

		this.my = new My(this);
		this.game = new Game(this);
		this.types = new Types(this);
		this.systems = new Systems(this);
		this.locations = new Locations(this);

		this.requests = 2;
		this.reset = Infinity;
	}

	//TODO: Maybe extract ratelimiting to its own class
	async sendRequest(method, path, parameters = "") {
		if(this.reset <= Date.now()) {
			this.requests = 2;
		}
		
		if(!this.requests) {
			await waitMs(this.reset - Date.now());
			
			this.requests = 2;
		}
		
		const res = await sendRequest(method, "api.spacetraders.io", path, `token=${this.token}&${parameters}`);

		this.requests --;

		this.reset = Date.now() + parseFloat(res.headers["retry-after"]) * 1000;
		
		return await getData(res);
	}
}