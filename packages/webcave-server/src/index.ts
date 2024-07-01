import Config from './config/index.ts'
import logger from './utils/logger.ts'
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import app from './app.ts'

const expressServer = express();
const httpServer = createServer(expressServer);
const socketServer = new Server(httpServer, {
  cors: Config.CORS_POLICY
})

const { world } = app(socketServer, httpServer);

setInterval( function saveWorld() {
  world.saveToFile(Config.WORLD_FILE_NAME);
  logger.info( "Saved world to file." );
}, Config.SECONDS_BETWEEN_SAVES * 1000 );