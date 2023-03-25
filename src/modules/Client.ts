import axios from 'axios';
import FormData from 'form-data';
import { app as expressApp } from '../lib/express';
import { WebSocket } from '../lib/ws';

class Client {
  constructor() {}

  async send({ file, fileLength }: { file: FormData; fileLength: number }) {
    await axios.post('http://localhost:8989/upload', file, {
      headers: {
        'content-length': fileLength,
      },
    });
  }

  async start() {
    const server = expressApp.listen(8988);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const ws = new WebSocket('ws://localhost:8989/ws');
    // ws.on("message", this.handleMessage.bind(this)); .
  }

  // handleMessage(message: WebSocket.Data) {
  //   console.log(
  //     "🚀 FSK >> file: Client.ts:26 >> Client >> message:",
  //     message
  //   );
  // }
}

export default Client;
