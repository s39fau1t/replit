import Path from "./path.js";

export default class Game extends Path {
	async status() {
		return (await this.user.sendRequest("GET", "game/status")).status;
	}

	async leaderboard() {
		return (await this.user.sendRequest("GET", "game/leaderboard/net-worth")).netWorth;
	}
}