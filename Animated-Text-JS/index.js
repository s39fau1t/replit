const rl = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

function isElipsis(text, index) {
	return text.slice(index, index + 3) === "..." || text.slice(index - 1, index + 2) === "..." || text.slice(index - 2, index + 1) === "...";
};

function animText(text) {
	let i = 0;

	setTimeout(function interval() {

		rl.write(text[i]);

		i ++;

		if(text[i]) {
			setTimeout(interval, isElipsis(text, i) ? 500 : 100);
		}
	}, isElipsis(text, i) ? 500 : 100);
};

animText("Hello world!\n\n\nHow are you doing?\n...\n...\n...\nBye...");