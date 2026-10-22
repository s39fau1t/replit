import * as net from "node:net";

const server = net.createServer(socket => {
	socket.write("hi");
});

server.listen(8000);