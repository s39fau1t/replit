(() => {
	function getScript(src) {
		const script = document.createElement("script");

		script.src = `https://biobit.cppbest.repl.co/${src}`;

		document.body.appendChild(script);
	}

	getScript("writer.js");
	getScript("reader.js");
	getScript("bot.js");
})();