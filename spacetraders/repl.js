import repl from "repl";
import util from "util";

import User from "./spacetraders/user.js";
import {waitMs} from "./spacetraders/utils.js";

const user = new User(process.env.token);

const r = repl.start({
	prompt: " ",
	writer: output => {
		return util.inspect(output, {
			depth: null,
			colors: true
		});
	}
});

r.context.waitMs = waitMs;
r.context.user = user;