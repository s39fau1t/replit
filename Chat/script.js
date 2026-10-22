const usernameInput = document.getElementById("username-input"), usernameSubmit = document.getElementById("username-submit"), messageInput = document.getElementById("message-input"), messageDiv = document.getElementById("message-div");

usernameSubmit.onclick = () => {
  if(!usernameInput.validity.tooShort && usernameInput.value.trim()) {
    const request = new XMLHttpRequest();
    request.open("GET", `https://chat.danielrichards9.repl.co/username-check?name=${usernameInput.value}`);
    request.onloadend = () => {
      if(request.response === "free") {
        usernameSubmit.style.display = "none";
        usernameInput.style.display = "none";
        messageDiv.style.display = "block";
        messageInput.style.display = "block";

        const webSocket = new WebSocket("wss://chat.danielrichards9.repl.co/");

        webSocket.onopen = () => {
          webSocket.send(JSON.stringify({type: "username", data: usernameInput.value}));
          window.onkeypress = event => {
            if(event.keyCode === 13) {
              if(document.activeElement !== messageInput) {
                messageInput.focus();
              }else {
                messageInput.blur();
                if(messageInput.value) {
                  webSocket.send(JSON.stringify({type: "message", data: messageInput.value}));
                  messageInput.value = "";
                }
              }
            }
          };
        };

        webSocket.onmessage = event => {
          const shouldScroll = messageDiv.scrollTop + messageDiv.clientHeight >= messageDiv.scrollHeight;

          const p = document.createElement("p");
          p.textContent = event.data;
          messageDiv.appendChild(p);

          if(shouldScroll) {
            messageDiv.scrollTop = messageDiv.scrollHeight;
          }
        };
      }else {
        alert("Username taken");
      }
    };
    request.send();
  }else {
    alert("Username must be at least 3 characters");
  }
};