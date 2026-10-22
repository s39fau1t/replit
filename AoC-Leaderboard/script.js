const leaderboard = document.getElementById("leaderboard").children[1];

function addData(row, data) {
	const td = document.createElement("td");
	td.innerHTML = data;
	row.appendChild(td);
}

function loadLeaderboard() {
	leaderboard.replaceChildren();
	
	fetch("leaderboard").then(data => data.json()).then(data => {
		const members = Object.values(data.members);
		
		for(let i in members) {
			const person = members[i];
			
			const row = document.createElement("tr");

			addData(row, parseInt(i) + 1);

			let icon = "";

			if(i === "0") {
				icon = "<img class=\"no-bounce\" src=\"images/gold.png\" width=\"15px\">";
			}else if(i === "1") {
				icon = "<img class=\"no-bounce\" src=\"images/silver.png\" width=\"15px\">";
			}else if(i === "2") {
				icon = "<img class=\"no-bounce\" src=\"images/bronze.png\" width=\"15px\">";
			}
			addData(row, `${icon} ${person.name}`);
			addData(row, person.local_score);
			addData(row, person.stars);
	
			leaderboard.appendChild(row);
		}
	});
}

loadLeaderboard();