import axios from "axios";
import FormData from "form-data";
import { expressApp, WebSocket } from "./express.js";

class Client {
  constructor() {

  }

  async send({ file, fileLength }) {
    await axios.post('http://localhost:8989/upload', file, {
      headers: {
        'content-length': fileLength
      }
    })
  }

  async start() {
    const server = expressApp.listen(8988);

    const ws = new WebSocket('ws://localhost:8989/ws');
    ws.on('message', this.handleMessage);
  }

  handleMessage(message) {
    console.log('🚀 FSK >> file: Client.js:36 >> Client >> message:', message);
  }
}

export default Client;