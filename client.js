import net from 'net';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, TOTAL_LENGTH_SIZE } from './constants.js';

// 서버에 연결할 호스트와 포트
const HOST = 'localhost';
const PORT = 5555;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('Connected to server');

  const message = 'Hello';
  const test = Buffer.from(message);

  const header = writeHeader(test.length, 10);
  const packet = Buffer.concat([header, test]);
  client.write(packet);

  // 1024바이트를 넘는 메시지 보내기
  // const longMessage = 'V'.repeat(1024);
  // const longMessageBuffer = Buffer.from(longMessage);
  //
  // const longHeaderBuffer = writeHeader(longMessageBuffer.length, 10);
  // const longPacket = Buffer.concat([longHeaderBuffer, longMessageBuffer]);
  // client.write(longPacket);

  // const message = 'Hello';
  // const test = Buffer.from(message);

  // const header = writeHeader(test.length, 999); // 존재하지 않는 핸들러 ID
  // const packet = Buffer.concat([header, test]);
  // client.write(packet);
});

client.on('data', (data) => {
  const buffer = Buffer.from(data); // 버퍼 객체의 메서드를 사용하기 위해 변환

  const { handlerId, length } = readHeader(buffer);
  console.log(`handlerId: ${handlerId}`);
  console.log(`length: ${length}`);

  const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
  // 메시지 추출
  const message = buffer.slice(headerSize); // 앞의 헤더 부분을 잘라낸다.

  console.log(`server 에게 받은 메세지: ${message}`);
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
