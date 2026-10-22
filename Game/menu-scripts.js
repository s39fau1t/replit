	/* To do
	title screen/menu
	waiting room for players (connect with other players)
	game (you might want to start here)
		camera move
		simple gui
			resource levels
			population count
			builiding selection
		ability to place generic building
		give buildings complexity
			different buildings
			do stuff with buildings
			"production" with buildings
		add people
			people can live in houses
			add people list in gui
		Procedural generation
			procedural structures
				trees
				monster dens
			procedural terrain
			linkie: https://medium.com/@henchman/adventures-in-procedural-terrain-generation-part-1-b64c29e2367a
*/

/* Game description
	You start the game by selecting your race (humans, dwarves, or elves), some starting resources, stats, and techs (tbd what this means).
	You start the game with your group in a random location. (There might be some parameters for this location).
	You have different units:
		workers - collect resources, build, and move resources
		scouts - explore the map for terrain and resources
		soldiers - do fighting
		mage - cast spells
		These are maybes:
			engineer - build special machines
			scholar - research civics
			inventor/scientist - research machines and techs
	You have different buildings:
		house
		storage
		mine
		forge
		watch tower
		walls


	shallow ores:
		iron
		gold
		coal
		
*/

//TODO: Replace alerts with custom alert message (made with html)

let scene = "menu";

let webSocket = null;

let name = null;

const scenes = {
	menu: document.getElementById("menu-container"),
	roomSelect: document.getElementById("room-select-container"),
	createRoom: document.getElementById("create-room-container"),
	connecting: document.getElementById("connecting-container"),
	room: document.getElementById("room-container"),
	loading: document.getElementById("loading-container"),
	game: document.getElementById("game-container")
};

function changeScene(newScene) {
	scenes[scene].hidden = true;

	scenes[newScene].hidden = false;

	scene = newScene;
}

const nameInput = document.getElementById("name-input");

function setName() {
	name = nameInput.value;
}

const gameStartText = document.getElementById("game-start-text");

const chatContainer = document.getElementById("chat-container");

function inRoom(event) {
	const message = JSON.parse(event.data);

	switch(message.type) {
		case "chat":
			addToChat(message.data);
			break;
		case "playersUpdate":
			for(let i = playersContainer.children.length - 1; i >= 1; i --) {
				playersContainer.children[i].remove();
			}

			let seenSelf = false;

			for(let player of message.data) {
				if(player.name === name && !seenSelf) {
					seenSelf = true;
					
					continue;
				}

				addToPlayers(player.name);
			}
			break;
		case "countdown":
			gameStartText.textContent = `Game starting in ${message.data}`;
			break;
		case "loading":
			gameStartText.textContent = "Waiting for room owner to start game...";

			scenes.loading.appendChild(chatContainer);
			
			changeScene("loading");
			break;
		case "start":
			//Move chat container to game
			scenes.game.appendChild(chatContainer);
			
			changeScene("game");
	
			//Change onmessage to include update
			webSocket.onmessage = inGame;
	
			//Initialize game
			initGame(message);
	
			//Start game loop
			setInterval(loop, 1000 / 60);
			break;
	}
}

chatInput = document.getElementById("chat-input");

function chatOnkeypress(event) {
	if(event.key === "Enter") {
		if(document.activeElement === chatInput) {
			if(chatInput.value) {
				webSocket.send(JSON.stringify({type: "chat", data: chatInput.value}));
			}

			chatInput.value = "";

			chatInput.blur();
		}else {
			chatInput.focus();
		}
	}
}

function joinRoom(roomName, owner) {
	webSocket = new WebSocket(`wss://Game.danielrichards9.repl.co?room=${roomName}&name=${name}`);

	changeScene("connecting");

	//Add self to room
	addToPlayers(name);

	webSocket.onopen = () => {
		if(owner) {
			changeScene("room");

			window.onkeypress = chatOnkeypress;
			
			showOwnerControls();

			webSocket.onmessage = inRoom;
		}else {
			webSocket.onmessage = event => {
				const message = JSON.parse(event.data);
	
				if(message.type === "playersUpdate") {
					let seenSelf = false;
	
					for(let player of message.data) {
						if(player.name === name && !seenSelf) {
							seenSelf = true;
							
							continue;
						}
	
						addToPlayers(player.name);
					}
	
					changeScene("room");
	
					window.onkeypress = chatOnkeypress;
	
					hideOwnerControls();

					webSocket.onmessage = inRoom;
				}
			};
		}
	};

	webSocket.onerror = () => {
		alert("Error connecting to room");

		changeScene("roomSelect");

		populateRoomsList();
	};
}

const roomNameInput = document.getElementById("room-name-input");

function createRoom() {
	const request = new XMLHttpRequest();

	request.open("POST", "https://Game.danielrichards9.repl.co/rooms");

	request.onload = () => {
		joinRoom(roomNameInput.value, true);

		roomNameInput.value = "";
	};

	request.send(roomNameInput.value);
}

const ownerControls = document.getElementById("owner-controls");

function showOwnerControls() {
	ownerControls.hidden = false;
}

function hideOwnerControls() {
	ownerControls.hidden = true;
}

const playersContainer = document.getElementById("players-container");

function addToPlayers(name) {
	const playerDiv = document.createElement("div");

	playerDiv.className = "player";

	playerDiv.textContent = name;

	playersContainer.appendChild(playerDiv);
}

const chatMessages = document.getElementById("chat-messages");

function addToChat(message) {
	const atBottom = chatMessages.scrollTop + chatMessages.clientHeight + 1 >= chatMessages.scrollHeight;
	
	const chat = document.createElement("div");

	chat.className = "chat";

	chat.textContent = message;

	chatMessages.appendChild(chat);

	if(atBottom) {
		chatMessages.scrollTop = chatMessages.scrollHeight;	
	}
}

const roomsList = document.getElementById("rooms-list");

function populateRoomsList() {
	for(let i = roomsList.children.length - 1; i >= 0; i --) {
		roomsList.children[i].remove();
	}
	
	const request = new XMLHttpRequest();

	request.open("GET", "https://Game.danielrichards9.repl.co/rooms");

	request.onload = () => {
		const rooms = JSON.parse(request.response);

		for(let sentRoom of rooms) {
			const roomDiv = document.createElement("div"), nameDiv = document.createElement("div"), playersDiv = document.createElement("div");

			roomDiv.className = "room";

			roomDiv.onclick = () => {
				const request = new XMLHttpRequest();

				request.open("GET", `https://Game.danielrichards9.repl.co/room?room=${sentRoom.name}`);

				request.onload = () => {
					const response = JSON.parse(request.response);

					if(response.players.length < response.maxPlayers) {
						joinRoom(sentRoom.name, false);
					}else {
						alert("Room full");
					}
				};

				request.send();
			};

			nameDiv.className = "name";
			playersDiv.className = "players";

			nameDiv.textContent = sentRoom.name;
			playersDiv.textContent = `${sentRoom.players}/${sentRoom.maxPlayers}`;

			roomDiv.appendChild(nameDiv);
			roomDiv.appendChild(playersDiv);

			roomsList.appendChild(roomDiv);
		}
	};

	request.send();
}

function startGame() {
	webSocket.send(JSON.stringify({type: "start"}));
}

function closeConnection() {
	webSocket.close();

	webSocket = null;

	window.onkeypress = null;

	playersContainer.replaceChildren();
	
	chatMessages.replaceChildren();
}