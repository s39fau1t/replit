const crypto = require("crypto");

function generateAcceptValue(acceptKey) {
  return crypto.createHash("sha1").update(acceptKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
};

function parseMessage(buffer) {
  //Buffer is in binary. A number in binary is a bit. A byte contains 8 bits. See https://datatracker.ietf.org/doc/html/rfc6455#section-5.2 for the structure of the buffer
  //Read first byte from the buffer
  const firstByte = buffer.readUInt8(0);
  //Get the first bit, which is whether or not this is the final fragment in a message
  //To do this, we must use the right shift operator to shift the byte 7 bits to the right, so we are left with the first value. Ex. 10000001 >>> 7 = 1
  //Turn it into a boolean for convinience
  const isFinalFrame = Boolean(firstByte >>> 7);
  //The next three bits are reserved and are almost always 0 unless you do something to make it otherwise. We will ignore them.
  //The last 4 bits are the opcode which says what type of frame this is. Look at the rfc for more details. We will use the and operator with 0b00001111 (0b means binary) to get the last 4 bits. Ex. 0b00001111 = 00001111 (in binary) firstByte = 10000001. firstByte & 0b00001111 = 00000001 because the and operator goes through each bit and makes it 1 only if both of the bits are 1
  const opcode = firstByte & 0b00001111;

  if(opcode !== 0x1) {
    //If the frame is not a text frame return the opcode.
    return JSON.stringify({type: opcode});
  }
  //Read the second byte
  const secondByte = buffer.readUInt8(1);
  //Get the first bit, whether or not the message is masked. All messages from the client to the server must be masked.
  const isMasked = secondByte >>> 7;
  //All messages from the client to the server must be masked. If one isn't, close the connection with the client https://datatracker.ietf.org/doc/html/rfc6455#section-5.1
  if(!isMasked) {
    return JSON.stringify({type: null});
  }
  //Get the length of the data. Use & to do this.
  let dataLength = secondByte & 0b01111111, currentOffset = 2;
  //If the length of the data is more than 125, it gets extended.
  if(dataLength > 125) {
    if(dataLength === 126) {
      //It gets extended by 2 bytes
      dataLength = buffer.readUInt16BE(currentOffset);
      currentOffset += 2;
    }else if(dataLength === 127) {
      //It gets extended by 8 bytes
      //WIP
      return JSON.stringify({type: null});
    }
  }
  //Get the masking key, the next 4 bytes, and the 4 individual octets using left shift to shift all the way to the left and then right shift to shift all the way to the right because I didn't want to write a bunch of zeros
  const maskingKey = buffer.readUInt32BE(currentOffset);
  const maskingOctets = [maskingKey >>> 24, maskingKey << 8 >>> 24, maskingKey << 16 >>> 24, maskingKey << 24 >>> 24];
  currentOffset += 4;
  //Create a new buffer with the same length as the data to store the unmasked data
  const unmaskedData = Buffer.alloc(dataLength);
  //Loop through the length of the data, unmasking as we go https://datatracker.ietf.org/doc/html/rfc6455#section-5.3
  for(let i = 0, j = 0; i < dataLength; i ++, j = i % 4) {
    const maskedByte = buffer.readUInt8(currentOffset);
    const maskingByte = maskingOctets[j];

    unmaskedData.writeUInt8(maskingByte ^ maskedByte, i);

    currentOffset ++;
  }
  return unmaskedData.toString();
};

function createResponseBuffer(opcode, message) {
  //If the message is undefined set it to an empty string
  message = message || "";
  //Get the length in bytes of the message
  const dataLength = Buffer.byteLength(message);
  //The amount of extra bytes for the length
  const extraLengthByteCount = dataLength < 126 ? 0 : 2;
  //The amount for the first byte of length
  const firstLength = extraLengthByteCount === 0 ? dataLength : 126;
  //Create a buffer with space for all of the components: Final frame, the three reserved bits, the opcode, if it is masked, the data length, and the data
  const response = Buffer.alloc(2 + dataLength + extraLengthByteCount);
  //Write the first byte to the buffer, 1 for the final frame, 0 for the reserved values, and whatever we want the opcode to be
  response.writeUInt8(0b10000000 + opcode, 0);
  //Write the second byte to the buffer. The zero for masking is implied.
  response.writeUInt8(firstLength, 1);
  //Set the offset to 2, and if we need extra bytes add them to the buffer and increase the offset by the amount of extra bytes.
  let dataOffset = 2;
  if(extraLengthByteCount > 0) {
    response.writeUInt16BE(dataLength, 2);
    dataOffset += extraLengthByteCount;
  }
  //Write the data to the buffer at the offset
  response.write(message, dataOffset);
  return response;
};

let clients = [];

const server = require("./staticServer")(clients);

server.on("upgrade", (req, socket) => {
  if(req.headers.upgrade !== "websocket") {
    socket.end("400 Bad Request");
    return;
  }

  const acceptKey = req.headers["sec-websocket-key"];

  const hash = generateAcceptValue(acceptKey);

  const responseHeaders = ["HTTP/1.1 101 Web Socket Protocol Handshake", "Upgrade: WebSocket", "Connection: Upgrade", `Sec-WebSocket-Accept: ${hash}`];

  socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");

  clients.push({socket: socket, isAlive: true});

  socket.on("data", buffer => {
    const message = JSON.parse(parseMessage(buffer));
    const sockets = clients.map(client => client.socket);
    switch(message.type) {
      case "message":
        for(let client of clients) {
          client.socket.write(createResponseBuffer(0x1, `${clients[sockets.indexOf(socket)].username}: ${message.data}`));
        }
        break;
      case "username":
        clients[sockets.indexOf(socket)].username = message.data;
        for(let client of clients) {
          client.socket.write(createResponseBuffer(0x1, `${message.data} joined`));
        }
        break;
      case 0x8:
        const deletedClient = clients[sockets.indexOf(socket)];
        clients.splice(sockets.indexOf(socket), 1);
        for(let client of clients) {
          client.socket.write(createResponseBuffer(0x1, `${deletedClient.username} left`));
        }
        break;
      case 0xA:
        clients[sockets.indexOf(socket)].isAlive = true;
        break;
      case null:
        socket.write(createResponseBuffer(0x8, "1002 Protocol Error"));
        break;
    }
  });
});

setInterval(() => {
  for(let client of clients) {
    if(client.isAlive) {
      client.socket.write(createResponseBuffer(0x9));
      client.isAlive = false;
    }else {
      client.socket.destroy();
      clients.splice(clients.indexOf(client), 1);
      for(let otherClient of clients) {
        otherClient.socket.write(createResponseBuffer(0x1, `${client.username} left`));
      }
    }
  }
}, 30000);

server.listen(8000);