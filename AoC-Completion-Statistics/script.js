fetch("stats").then(res => res.json()).then(data => {
	new Chart(document.getElementById("chart"), {
		type: "line",
		data: {
			labels: Object.keys(data.both).map(x => parseInt(x) + 1),
			datasets: [
				{
					label: "Both",
					data: data.both,
					borderWidth: 3,
					borderColor: "#ffd700"
				},
				{
					label: "First Part Only",
					data: data.firstOnly,
					borderWidth: 3,
					borderColor: "#9999cc"
				}
			]
		}
	});
});