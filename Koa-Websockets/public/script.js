const ws = new WebSocket("wss://Koa-Websockets.cppbest.repl.co");

const chats = document.getElementById("chats");
const chatInput = document.getElementById("chat-input");

const username = crypto.randomUUID();

window.onkeydown = event => {
	if(event.key === "Enter") {
		if(chatInput === document.activeElement) {
			if(chatInput.value) {
				ws.send(JSON.stringify({username, message: chatInput.value}));
				
				chatInput.value = "";
			}
			
			chatInput.blur();
		}else {
			chatInput.focus();
		}
	}
};

ws.onmessage = event => {
	const p = document.createElement("p");
	p.textContent = event.data;
	p.className = "chat";
	chats.appendChild(p);

	chats.scrollTop = chats.scrollHeight;
};