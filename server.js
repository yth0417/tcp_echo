import net from 'net';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, TOTAL_LENGTH_SIZE, MAX_MESSAGE_LENGTH } from './constants.js';
import handlers from './handlers/index.js';

const PORT = 5555;

const server = net.createServer((socket) => {
  console.log(`Client connected from: ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (data) => {
    const buffer = Buffer.from(data); // 버퍼 객체의 메서드를 사용하기 위해 변환

    const { handlerId, length } = readHeader(buffer);
    console.log(`handlerId: ${handlerId}`);
    console.log(`length: ${length}`);

    // 메시지 길이 확인
    if (length > MAX_MESSAGE_LENGTH) {
      console.error(`Error: Message length ${length} exceeds maximum of ${MAX_MESSAGE_LENGTH}`);
      socket.write('Error: Message too long');
      socket.end();
      return;
    }

    const handler = handlers[handlerId];

    // 핸들러 ID 확인
    if (!handler) {
      console.error(`Error: No handler found for ID ${handlerId}`);
      socket.write(`Error: Invalid handler ID ${handlerId}`);
      socket.end();
      return;
    }

    const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
    // 메시지 추출
    const message = buffer.slice(headerSize); // 앞의 헤더 부분을 잘라낸다.
    console.log(`client 에게 받은 메세지: ${message}`);

    const responseMessage = handler(message);
    const responseBuffer = Buffer.from(responseMessage);

    const header = writeHeader(responseBuffer.length, handlerId);
    const responsePacket = Buffer.concat([header, responseBuffer]);

    socket.write(responsePacket);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`Echo server listening on port ${PORT}`);
  console.log(server.address());
});
