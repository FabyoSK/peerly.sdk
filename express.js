import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

const expressApp = express();

export {
  expressApp,
  WebSocketServer,
  WebSocket
};
