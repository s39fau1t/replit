const crypto = require("crypto"),readline = require("readline"),  rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function hash(password) {
	const salt = crypto.randomBytes(16).toString("hex");

	return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
};

function verify(password, hash) {
	const [salt, key] = hash.split(":");

	return crypto.timingSafeEqual(Buffer.from(key, "hex"), crypto.scryptSync(password, salt, 64));
};

rl.question("Please enter your password:", answer => {
	const password = answer;
	rl.question("What is your password?\n", answer => {
		if(password === answer) {
			rl.write("Correct!");
		}else {
			rl.write("Incorrect!");
		}
		rl.write("\n");
		rl.close();
	});
});