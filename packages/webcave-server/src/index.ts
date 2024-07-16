import Config from './config'
import logger from './utils/logger'
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import app from './app'

const expressServer = express();
const httpServer = createServer(expressServer);
const socketServer = new Server(httpServer, {
  cors: Config.CORS_POLICY
})

const { world } = app(socketServer, httpServer);

setInterval( function saveWorld() {
  world.saveToFile();
  logger.info( "Saved world to file." );
}, Config.SECONDS_BETWEEN_SAVES * 1000 );

export default socketServer;