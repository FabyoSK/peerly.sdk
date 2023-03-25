/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import { app as expressApp } from '../lib/express';
import { WebSocket } from '../lib/ws';
// @ts-ignore
// import Evilscan from 'evilscan';
class Client {
  private username: string;
  ws: WebSocket | undefined;

  constructor() {
    this.username = 'Peerly Sender';
  }

  async send({ file, fileLength }: { file: any; fileLength: number }) {
    await axios.post(
      `http://localhost:8989/upload?id=${Math.random() * 10}&filename=fsk-${
        Math.random() * 100
      }`,
      file,
      {
        headers: {
          'content-length': fileLength,
        },
      }
    );
  }

  async start(): Promise<void> {
    const server = expressApp.listen(8988);

    // 192.168.0.0/24

    // const options = {
    //   target: '192.168.0.0/24',
    //   port: '8989',
    //   status: 'TROU', // Timeout, Refused, Open, Unreachable
    //   banner: true,
    // };

    // const evilscan = new Evilscan(options);

    // evilscan.on('result', (data: any) => {
    //   // fired when item is matching options
    //   console.log(data);
    // });

    // evilscan.on('error', (err: any) => {
    //   throw new Error(err);
    // });

    // evilscan.on('done', () => {
    //   // finished !
    // });

    // evilscan.run();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const ws = new WebSocket('ws://localhost:8989/ws');

    // this.ws = ws;
    ws.on('open', () => {
      ws.send(
        JSON.stringify({
          type: 'USER_CONNECTED',
          payload: {
            username: this.username,
          },
        })
      );
    });
  }

  // handleMessage(message: WebSocket.Data) {
  //   console.log(
  //     "🚀 FSK >> file: Client.ts:26 >> Client >> message:",
  //     message
  //   );
  // }
  /**
   * Set user name
   */
  public setUserName(name: string): this {
    this.username = name;
    return this;
  }
}

export default Client;
