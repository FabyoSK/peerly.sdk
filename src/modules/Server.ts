import axios from 'axios';
import FormData from 'form-data';
import { app as express } from '../lib/express';
import { WebSocketServer } from '../lib/ws';
import fs from 'fs';
import EventEmitter from 'events';

class Server {
  private eventEmitter: EventEmitter;
  private username: string;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.username = 'Peerly Receiver';
  }

  public async send(file: fs.ReadStream): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:8989/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  public async start(): Promise<void> {
    express.post('/upload', async (req, res) => {
      // console.log('Upload route hit');

      const { id, filename } = req.query;

      const stream = fs.createWriteStream(filename as string);
      stream.on('open', () => {
        this.eventEmitter.emit('file-upload', {
          id,
          name: filename,
        });
        req.pipe(stream);
      });

      stream.on('drain', () => {
        const written = stream.bytesWritten;
        const fileSizeInBytes = parseInt(
          req.headers['content-length'] as string
        );
        const totalInMb = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
        const totalWrittenInMb = (written / (1024 * 1024)).toFixed(2);
        const percentage = ((written / fileSizeInBytes) * 100).toFixed(2);

        this.eventEmitter.emit('update-progress', {
          id,
          percentage,
          totalWrittenInMb,
          totalInMb,
        });
      });

      stream.on('close', () => {
        const fileSizeInBytes = parseInt(
          req.headers['content-length'] as string
        );
        const totalInMb = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

        this.eventEmitter.emit('update-progress', {
          id,
          percentage: '100',
          totalWrittenInMb: totalInMb,
        });

        res.send({ status: 'success' });
      });

      stream.on('error', err => {
        console.error(err);
      });
    });

    const server = express.listen(8989);

    const wsServer = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
      });
    });

    wsServer.on('connection', socket => {
      socket.on('message', message => {
        const { type, payload } = JSON.parse(message.toString());

        switch (type) {
          case 'USER_CONNECTED':
            this.eventEmitter.emit('user-connected', payload);
            break;

          default:
            break;
        }
      });
    });
  }

  private handleMessage(message: any): void {
    console.log('🚀 FSK >> file: Server.js:36 >> Server >> message:', message);
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Set user name
   */
  public setUserName(name: string): this {
    this.username = name;
    return this;
  }
}

export default Server;
