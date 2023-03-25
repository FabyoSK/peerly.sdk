import axios from 'axios';
import FormData from 'form-data';
import { app as express } from '../lib/express';
import { WebSocketServer } from '../lib/ws';
import fs from 'fs';
import EventEmitter from 'events';

class Server {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
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
      console.log('Upload route hit');

      const stream = fs.createWriteStream('tmp2.mp4');
      stream.on('open', () => {
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
          percentage,
          totalWrittenInMb,
          totalInMb,
        });
      });

      stream.on('close', () => {
        console.log('Processing  ...  100%');
        this.eventEmitter.emit('update-progress', 'njnjn');
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
        console.log(
          '🚀 FSK >> file: Server.js:36 >> Server >> message:',
          message
        );
      });
    });
  }

  public handleMessage(message: any): void {
    console.log('🚀 FSK >> file: Server.js:36 >> Server >> message:', message);
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }
}

export default Server;
