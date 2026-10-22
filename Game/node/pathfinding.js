//HALTING WORK FOR NOW

function dist(x1, y1, x2, y2) {
	return Math.hypot(x1 - x2, y1 - y2);
}

class Edge {
	constructor(node, cost) {
		this.node = node;

		this.cost = cost;
	}
}

class Node {
	constructor(x, y, cluster) {
		this.x = x;
		this.y = y;

		this.cluster = cluster;

		this.cost = Infinity;
		
		this.edges = [];

		this.previous = null;
	}

	addEdge(node, cost = 1) {
		this.edges.push(new Edge(node, cost));
	}

	static adjacent(node1, node2) {
		return Math.floor(dist(node1.x, node1.y, node2.x, node2.y)) === 1;
	}
}

class Entrance {
	constructor(cluster1, cluster2, x1, y1, x2, y2) {
		this.cluster1 = cluster1;
		this.cluster2 = cluster2;

		this.x1 = x1;
		this.y1 = y1;

		this.x2 = x2;
		this.y2 = y2;
	}
}

class Cluster {
	constructor(x, y, level) {
		this.x = x;
		this.y = y;

		this.level = level;

		this.nodes = [];

		this.tempNodes = [];
	}

	addNode(node) {
		this.nodes.push(node);
	}

	addTempNode(node) {
		this.addNode(node);

		this.tempNodes.push(node);
	}

	removeTempNodes() {
		for(let tempNode of this.tempNodes) {
			const i = this.nodes.indexOf(tempNode);

			this.nodes.splice(i, 1);

			for(let edge of tempNode.edges) {
				const {node} = edge;

				for(let i = node.edges.length - 1; i >= 0; i --) {
					if(node.edges[i].node === tempNode) {
						node.edges.splice(i, 1);

						break;
					}
				}
			}
		}

		this.tempNodes.splice(0);
	}

	createGraph(map) {
		const graph = [];

		for(let y = 0; y < 10; y ++) {
			graph.push([]);

			for(let x = 0; x < 10; x ++) {
				graph[y].push(new Node(x, y, this));
			}
		}

		for(let i = 0; i < 10; i ++) {
			for(let node1 of graph[i]) {
				for(let j = 0; j < 10; j ++) {
					for(let node2 of graph[j]) {
						if(Node.adjacent(node1, node2) && node2.x >= node1.x && node2.y >= node1.y && !map[node1.y + this.y][node1.x + this.x] && !map[node2.y + this.y][node2.x + this.x]) {
							node1.addEdge(node2);
							node2.addEdge(node1);
						}
					}
				}
			}
		}

		return graph;
	}

	static adjacent(cluster1, cluster2) {
		return Math.floor(dist(cluster1.x, cluster1.y, cluster2.x, cluster2.y) / 10 ** (cluster1.level + 1)) === 1;
	}

	static buildEntrances(map, cluster1, cluster2) {
		const entrances = [];
		
		//Where in relation to cluster1 cluster2 is
		const xOff = (cluster2.x - cluster1.x) / 10;
		const yOff = (cluster2.y - cluster1.y) / 10;

		//The x and y of the start of the line, relative to 0, 0
		const firstX = cluster1.x + Math.max(xOff * 9, 0);
		const firstY = cluster1.y + Math.max(yOff * 9, 0);

		//The x and y of the start of the symmetrical line, relative to 0, 0
		const firstSymmX = firstX + xOff;
		const firstSymmY = firstY + yOff;

		//If they are diagonal
		if(xOff && yOff) {
			//Only check the 2 squares for obstacles
			if(!(map[firstY][firstX] && map[firstSymmY][firstSymmX])) {
				entrances.push(new Entrance(cluster1, cluster2, firstX, firstY, firstSymmX, firstSymmY));
			}
		}else {
			const line = [];
			const symmLine = [];

			let xDir = 0;
			let yDir = 0;
			
			if(xOff) {
				for(let y = firstY; y < firstY + 10; y ++) {
					line.push(map[y][firstX]);
					symmLine.push(map[y][firstSymmX]);

					yDir = 1;
				}
			}else if(yOff) {
				for(let x = firstX; x < firstX + 10; x ++) {
					line.push(map[firstY][x]);
					symmLine.push(map[firstSymmY][x]);

					xDir = 1;
				}
			}

			line.push(1);
			symmLine.push(1);

			const currEntrance = {x1: firstX, y1: firstY, x2: null, y2: null};

			for(let i in line) {
				if(line[i] || symmLine[i]) {
					if(currEntrance.x2) {
						//Add to entrances
						if((currEntrance.x2 - currEntrance.x1) + (currEntrance.y2 - currEntrance.y1) < 6) {
							const middleX = (currEntrance.x1 + currEntrance.x2) / 2;
							const middleY = (currEntrance.y1 + currEntrance.y2) / 2;
							
							entrances.push(new Entrance(cluster1, cluster2, middleX, middleY, middleX + xOff, middleY + yOff));
						}else {
							entrances.push(new Entrance(cluster1, cluster2, currEntrance.x1, currEntrance.y1, currEntrance.x1 + xOff, currEntrance.y1 + yOff));
							entrances.push(new Entrance(cluster1, cluster2, currEntrance.x2, currEntrance.y2, currEntrance.x2 + xOff, currEntrance.y2 + yOff));
						}

						currEntrance.x2 = null;
						currEntrance.y2 = null;
					}

					currEntrance.x1 = firstX + parseFloat(i) * xDir;
					currEntrance.y1 = firstY + parseFloat(i) * yDir;
					
					continue;
				}

				currEntrance.x2 = firstX + parseFloat(i) * xDir;
				currEntrance.y2 = firstY + parseFloat(i) * yDir;
			}
		}

		return entrances;
	}
}

class Path {
	constructor(nodes, distance) {
		this.nodes = nodes;
		this.distance = distance;
	}
}

function findPath(start, goal, log = false) {
	start.cost = 0;
	
	let path;

	const nodesToReset = [];
	
	const explored = [];
	
	const reachable = [new Edge(start, 0)];

	while(reachable.length > 0) {
		let edge;

		let curCost = Infinity;

		for(let otherEdge of reachable) {
			const cost = otherEdge.cost + dist(otherEdge.node.x, otherEdge.node.y, goal.x, goal.y);

			if(cost < curCost) {
				edge = otherEdge;

				curCost = cost;
			}
		}

		const {node} = edge;

		if(log) {
			console.log(node.x, node.y);
		}
	
		if(node === goal) {
			const nodes = [];
	
			let curNode = node;
	
			while(curNode) {		
				nodes.push(curNode);
				
				curNode = curNode.previous;
			}
	
			path = new Path(nodes.reverse().slice(1), node.cost);

			break;
		}
	
		reachable.splice(reachable.indexOf(edge), 1);
	
		explored.push(node);
	
		for(let edge of node.edges) {
			if(!explored.includes(edge.node)) {
				if(!reachable.includes(edge)) {
					reachable.push(edge);
				}
	
				if(node.cost + edge.cost < edge.node.cost) {
					edge.node.cost = node.cost + edge.cost;
	
					edge.node.previous = node;

					nodesToReset.push(edge.node);
				}
			}
		}
	}

	for(let node of nodesToReset) {
		node.cost = Infinity;

		node.previous = null;
	}

	return path;
}

class HPAStarMap {
	constructor(map, maxLevels) {
		const levels = maxLevels - 1;
		
		this.map = map;

		this.width = this.map[0].length;
		this.height = this.map.length;

		this.clusters = [];

		//Preprocessing
		const entrances = [];

		console.time("Preprocessing");

		console.time("First Level");

		//Build clusters
		this.buildClusters(0);

		console.time("Build Entrances");

		//Maybe change to iterate less?
		for(let cluster1 of this.clusters[0]) {
			let adjacentClusters = 3;
			
			if(cluster1.x + 9 === this.width - 1) {
				adjacentClusters -= 2;
			}

			if(cluster1.y + 9 === this.height - 1) {
				adjacentClusters -= 2;
			}
			
			for(let cluster2 of this.clusters[0]) {
				if(Cluster.adjacent(cluster1, cluster2) && cluster2.x >= cluster1.x && cluster2.y >= cluster1.y) {
					entrances.push(...Cluster.buildEntrances(this.map, cluster1, cluster2));

					adjacentClusters --;
				}

				if(!adjacentClusters) {
					break;
				}
			}
		}

		console.timeEnd("Build Entrances");

		this.graph = [[], []];

		console.time("Add Inter Edges");

		for(let entrance of entrances) {
			let node1 = entrance.cluster1.nodes.find(node => node.x === entrance.x1 && node.y === entrance.y1);
			let node2 = entrance.cluster2.nodes.find(node => node.x === entrance.x1 && node.y === entrance.y1);

			if(!node1) {
				node1 = new Node(entrance.x1, entrance.y1, entrance.cluster1);

				entrance.cluster1.addNode(node1);

				this.graph[0].push(node1);
			}
			if(!node2) {
				node2 = new Node(entrance.x2, entrance.y2, entrance.cluster2);

				entrance.cluster2.addNode(node2);

				this.graph[0].push(node2);
			}

			node1.addEdge(node2);
			node2.addEdge(node1);
		}

		console.timeEnd("Add Inter Edges");

		console.time("Add Intra Edges");
		
		for(let cluster of this.clusters[0]) {
			const graph = cluster.createGraph(map);
			
			for(let i = 0; i < cluster.nodes.length - 1; i ++) {
				const node1 = cluster.nodes[i];
				
				for(let j = i + 1; j < cluster.nodes.length; j ++) {
					const node2 = cluster.nodes[j];

					//Search for distance
					let path = findPath(graph[node1.y - cluster.y][node1.x - cluster.x], graph[node2.y - cluster.y][node2.x - cluster.x]);

					if(path) {
						node1.addEdge(node2, path.distance);
						node2.addEdge(node1, path.distance);
					}
				}
			}
		}

		console.timeEnd("Add Intra Edges");

		console.timeEnd("First Level");

		console.time("Other Levels");

		for(let level = 1; level <= levels; level ++) {
			this.buildClusters(level);

			console.time("Get Entrances + Inter Edges");

			for(let cluster1 of this.clusters[level]) {
				let adjacentClusters = 3;
				
				if(cluster1.x + 90 === this.width - 10) {
					adjacentClusters -= 2;
				}
	
				if(cluster1.y + 90 === this.height - 10) {
					adjacentClusters -= 2;
				}
				
				for(let cluster2 of this.clusters[level]) {
					if(!adjacentClusters) {
						break;
					}
					
					if(!Cluster.adjacent(cluster1, cluster2) || cluster1.x > cluster2.x || cluster1.y > cluster2.y) {
						continue;
					}

					//Get entrances

					//Loop through the clusters of the lower level
					for(let cluster of this.clusters[level - 1]) {
						//If the cluster is within the first (big) cluster and next to the second (big) cluster
						if(!(cluster.x >= cluster1.x && cluster.x < cluster1.x + 10 ** (level + 1) && cluster.y >= cluster1.y && cluster.y < cluster1.y + 10 ** (level + 1) && (cluster.x + 10 ** level === cluster2.x || cluster.y + 10 ** level === cluster2.y))) {
							continue;
						}

						for(let node of cluster.nodes) {
							if(!(node.x === cluster2.x - 1 || node.y === cluster2.y - 1)) {
								continue;
							}

							let node2;

							for(let edge of node.edges) {
								//If the node if within the second cluster
								if(edge.node.x >= cluster2.x && edge.node.x < cluster2.x + 10 ** (level + 1) && edge.node.y >= cluster2.y && edge.node.y < cluster2.y + 10 ** (level + 1)) {
									node2 = new Node(edge.node.x, edge.node.y, cluster2);

									node2.lowerNode = edge.node;
									
									break;
								}
							}

							if(!node2) {
								continue;
							}

							const node1 = new Node(node.x, node.y, cluster1);

							node1.lowerNode = node;

							this.graph[level].push(node1, node2);

							node1.addEdge(node2);
							node2.addEdge(node1);

							cluster1.addNode(node1);
							cluster2.addNode(node2);
						}
					}

					adjacentClusters --;
				}
			}

			console.timeEnd("Get Entrances + Inter Edges");

			console.time("Intra Edges");
			
			for(let cluster of this.clusters[level]) {
				for(let i = 0; i < cluster.nodes.length - 1; i ++) {
					const node1 = cluster.nodes[i];
					
					for(let j = i + 1; j < cluster.nodes.length; j ++) {
						const node2 = cluster.nodes[j];

						//Search for distance
						const path = findPath(node1.lowerNode, node2.lowerNode);
	
						if(path) {
							node1.addEdge(node2, path.distance);
							node2.addEdge(node1, path.distance);
						}
					}
				}
			}

			console.timeEnd("Intra Edges");
		}

		console.timeEnd("Other Levels");

		console.timeEnd("Preprocessing");
	}

	buildClusters(level) {
		this.clusters[level] = [];

		const size = 10 ** (level + 1);
		
		for(let y = 0; y < this.height / size; y ++) {
			for(let x = 0; x < this.width / size; x ++) {
				this.clusters[level].push(new Cluster(x * size, y * size, level, this.map));
			}
		}
	}

	insertNode(node) {
		const maxLevel = this.graph.length - 1;

		let cluster;
		
		for(let level = 0; level <= maxLevel; level ++) {
			console.time("Get Cluster + Add Node");
			
			//Determine cluster
			const clusterSize = 10 ** (level + 1);

			cluster = this.clusters[level][Math.floor(node.y / clusterSize) * this.height / clusterSize + Math.floor(node.x / clusterSize)];
			
			//Add node to cluster
			cluster.addTempNode(node);

			console.timeEnd("Get Cluster + Add Node");

			console.time("New Intra Edges");
			
			//Add new intra edges
			if(!level) {
				const graph = cluster.createGraph(this.map);

				for(let node2 of cluster.nodes) {
					if(node === node2) {
						continue;
					}
					
					const path = findPath(graph[node.y - cluster.y][node.x - cluster.x], graph[node2.y - cluster.y][node2.x - cluster.x]);

					if(path) {
						node.addEdge(node2, path.distance);
						node2.addEdge(node, path.distance);
					}
				}
			}else {
				for(let node2 of cluster.nodes) {
					if(node === node2) {
						continue;
					}

					const path = findPath(node, node2.lowerNode, true);

					if(path) {
						node.addEdge(node2, path.distance);
						node2.addEdge(node, path.distance);
					}
				}
			}

			console.timeEnd("New Intra Edges");

			//Remove node from lower cluster
			if(node.cluster) {
				node.cluster.removeTempNodes();
			}

			node.cluster = cluster;
		}
	}

	findPath(startX, startY, goalX, goalY) {
		const start = new Node(startX, startY, null);
		const goal = new Node(goalX, goalY, null);

		console.time("Inserting Nodes");

		this.insertNode(start);
		this.insertNode(goal);

		console.timeEnd("Inserting Nodes");

		const path = findPath(start, goal);

		start.cluster.removeTempNodes();
		goal.cluster.removeTempNodes();

		return path;
	}
}

module.exports = HPAStarMap;

//Add this (shouldn't be too hard) https://harablog.wordpress.com/2009/01/29/clearance-based-pathfinding/
//SE https://gamedev.stackexchange.com/questions/104109/pathfinding-with-differently-sized-objects-on-tile-map?noredirect=1&lq=1

//https://sandruski.github.io/RTS-Group-Movement/ maybe?

//https://webdocs.cs.ualberta.ca/~mmueller/ps/hpastar.pdf Yes!

//Stack Exchange https://gamedev.stackexchange.com/questions/192183/how-does-hpahierarchical-pathfinding-a-really-work

//Stack Overflow https://stackoverflow.com/questions/37466738/pathfinding-on-large-map?noredirect=1&lq=1