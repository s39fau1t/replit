import path from "path";
import url from "url";
import fs from "fs";

import express from "express";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.get("/leaderboard", (req, res) => {
	res.sendFile(`${__dirname}/leaderboard.json`);
});

app.post("/leaderboard", (req, res) => {
	if(req.body.name.length > 12) {
		res.writeHead(422);
		res.end();

		return;
	}
	
	const data = JSON.parse(fs.readFileSync("leaderboard.json"));

	data.push(req.body);
	
	data.sort((a, b) => b.score - a.score);
	
	data.pop();

	fs.writeFileSync("leaderboard.json", JSON.stringify(data));

	setTimeout(() => {
		res.writeHead(200);
		res.end();
	}, 3000);
});

app.listen();