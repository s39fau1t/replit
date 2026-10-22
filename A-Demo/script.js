//WHAAAAAAAAT???? https://www.gdcvault.com/play/1022094/JPS-Over-100x-Faster-than

const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

const map = [
	"   xxxx   ",
	"  x     x ",
	"  x  x x x",
	"  x  x   x",
	" x  xx x x",
	"x    x x e",
	"  xxx  xxx",
	"    xxxxxx",
	"   x      ",
	"     s    ",
];

const nodes = [];

let start, end;

for(let strRow in map) {
	for(let strColumn in map[strRow]) {
		const row = parseFloat(strRow), column = parseFloat(strColumn);
		
		const node = {x: column, y: row, cost: Infinity, adjacentNodes: [], previous: null};
		
		if(map[row][column] === "s") {
			node.cost = 0;
			
			start = node;
		}else if(map[row][column] === "e") {
			end = node;
		}
		
		nodes.push(node);
	}
}

for(let node of nodes) {
	if(map[node.y][node.x] === "x") {
		continue;
	}
	
	if(node.x > 0 && (map[node.y][node.x - 1] === " " || map[node.y][node.x - 1] === "s" || map[node.y][node.x - 1] === "e")) {
		node.adjacentNodes.push(nodes[map[node.y].length * node.y + node.x - 1]);
	}

	if(node.x < map[node.y].length - 1 && (map[node.y][node.x + 1] === " " || map[node.y][node.x + 1] === "s" || map[node.y][node.x + 1] === "e")) {
		node.adjacentNodes.push(nodes[map[node.y].length * node.y + node.x + 1]);
	}

	if(node.y > 0 && (map[node.y - 1][node.x] === " " || map[node.y - 1][node.x] === "s" || map[node.y - 1][node.x] === "e")) {
		node.adjacentNodes.push(nodes[map[node.y].length * (node.y - 1) + node.x]);
	}

	if(node.y < map.length - 1 && (map[node.y + 1][node.x] === " " || map[node.y + 1][node.x] === "s" || map[node.y + 1][node.x] === "e")) {
		node.adjacentNodes.push(nodes[map[node.y].length * (node.y + 1) + node.x]);
	}
}

let iterations = 0;

const testedNodes = [];

function aStar(start, end) {
	const reachable = [start], explored = [];

	while(reachable.length > 0) {
		iterations ++;
		
		//const node = reachable[Math.floor(Math.random() * reachable.length)];
/*
		let node;

		for(let otherNode of reachable) {
			if(!node || node.cost > otherNode.cost) {
				node = otherNode;
			}
		}
*/

		let node;

		let curCost = Infinity;

		for(let otherNode of reachable) {
			const cost = otherNode.cost + Math.abs(otherNode.x - end.x) + Math.abs(otherNode.y - end.y);
			
			if(curCost > cost) {
				node = otherNode;

				curCost = cost;
			}
		}

		testedNodes.push(node);
		
		if(node === end) {
			const path = [];

			let curNode = end;

			while(curNode) {
				path.push(curNode);

				curNode = curNode.previous;
			}

			return path;
		}

		reachable.splice(reachable.indexOf(node), 1);

		explored.push(node);

		const newReachable = node.adjacentNodes.filter(node => !explored.includes(node));

		for(let adjacent of newReachable) {
			if(!reachable.includes(adjacent)) {
				reachable.push(adjacent);
			}

			if(node.cost + 1 < adjacent.cost) {
				adjacent.previous = node;

				adjacent.cost = node.cost + 1;
			}
		}
	}
}

const path = aStar(start, end);

ctx.fillStyle = "black";

for(let node of nodes) {
	if(map[node.y][node.x] === "x") {
		ctx.fillRect(node.x * 100, node.y * 100, 100, 100);
	}
}

ctx.fillStyle = "rgb(200, 200, 200)";

for(let node of testedNodes) {	
	ctx.fillRect(node.x * 100, node.y * 100, 100, 100);
}

ctx.fillStyle = "grey";

for(let node of path) {
	ctx.fillRect(node.x * 100, node.y * 100, 100, 100);
}

ctx.fillStyle = "green";

ctx.fillRect(start.x * 100, start.y * 100, 100, 100);

ctx.fillStyle = "yellow";

ctx.fillRect(end.x * 100, end.y * 100, 100, 100);

ctx.fillStyle = "black";

ctx.font = "10px sans-serif";

ctx.textAlign = "center";
ctx.textBaseline = "middle";

for(let node of testedNodes) {
	ctx.fillText(testedNodes.indexOf(node), node.x * 100 + 50, node.y * 100 + 50);
}

ctx.strokeStyle = "black";

for(let row in map) {
	for(let column in map[row]) {		
		ctx.strokeRect(column * 100, row * 100, 100, 100);
	}
}

const iterationsText = document.getElementById("iterations");

iterationsText.textContent = `Iterations: ${iterations}`;