/**
 * Useful WebSocket related utilities
 * @module websocket
 */

module.exports = {
	/**
	 * Respondes to a http upgrade request with the correct response headers
	 * @param {Object} req - The http request object
	 * @param {Object} socket - The socket for the connection
	 */
  handshake: (req, socket) => {
    const crypto = require("crypto");

    if(req.headers.upgrade !== "websocket") {
      socket.end("400 Bad Request");
      return;
    }

    const acceptKey = req.headers["sec-websocket-key"];

    const hash = crypto.createHash("sha1").update(`${acceptKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");

    const responseHeaders = ["HTTP/1.1 101 Web Socket Protocol Handshake", "Upgrade: WebSocket", "Connection: Upgrade", `Sec-WebSocket-Accept: ${hash}`];

    socket.write(`${responseHeaders.join("\r\n")}\r\n\r\n`);
  },
	/**
	 * Parses and unmasks a websocket message buffer
	 * @param {Object} buffer - The message buffer to parse
	 * @returns {Object} A new object containing the data from the buffer and the opcode
	 */
  parseMessage: buffer => {
    const firstByte = buffer.readUInt8(0);

    const opcode = firstByte & 0b00001111;

    if(opcode !== 0x1) {
      return {opcode: opcode, data: "null"};
    }

    const secondByte = buffer.readUInt8(1);

    const isMasked = secondByte >>> 7;

    if(!isMasked) {
      throw new Error("1002 protocol error");
    }

    let length = secondByte & 0b01111111, offset = 2;

    if(length > 125) {
      if(length === 126) {
        length = buffer.readUInt16BE(offset);
        offset += 2;
      }else {
        throw new Error("1002 protocol error");
      }
    }

    const maskingKey = buffer.readUInt32BE(offset);

    const maskingOctets = [maskingKey >>> 24, maskingKey >>> 16 & 0b000000000000000011111111, maskingKey >>> 8 & 0b000000000000000011111111, maskingKey & 0b000000000000000011111111];

    offset += 4;

    const data = Buffer.alloc(length);

    for(let i = 0, j = 0; i < length; i ++, j = i % 4) {
      const maskedByte = buffer.readUInt8(offset);

      const maskingByte = maskingOctets[j];

      data.writeUInt8(maskedByte ^ maskingByte, i);

      offset ++;
    }

    return {opcode: opcode, data: data.toString()};
  },
	/**
	 * Creates a websocket message buffer
	 * @param {number} opcode - The opcode of the message buffer
	 * @param {string} [message] - The data to write to the buffer
	 * @returns {Object} The new websocket buffer
	 */
  createMessage: (opcode, message = "") => {
    const length = Buffer.byteLength(message);

    const extraLength = length < 126 ? 0 : 2;

    const buffer = Buffer.alloc(2 + length + extraLength);

    buffer.writeUInt8(0b10000000 + opcode, 0);

    buffer.writeUInt8(extraLength ? 126 : length, 1);

    let offset = 2;

    if(extraLength) {
      buffer.writeUInt16BE(length, offset);
      offset += extraLength;
    }

    buffer.write(message, offset);

    return buffer;
  }
};