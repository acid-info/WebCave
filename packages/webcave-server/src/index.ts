import Config from './config/index.ts'
import logger from './utils/logger.ts'
import ServerWorld from './game/world.ts'
import WebCaveServer from './server.ts'
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { chatHandler } from './handlers/chat.ts'
import { joinHandler, leaveHandler } from './handlers/network.ts'

const world = new ServerWorld(
  Config.WORLD_SX,
  Config.WORLD_SY,
  Config.WORLD_SZ
);

logger.log( "Creating world..." );

if (world.loadFromFile(Config.WORLD_FILE_NAME)) {
  logger.log( "Loaded the world from file." );
} else {
  logger.log( "Creating a new empty world." );
  world.createFlatWorld( Config.WORLD_GROUNDHEIGHT );
  world.saveToFile(Config.WORLD_FILE_NAME);
}

const expressServer = express();
const httpServer = createServer(expressServer);
const socketServer = new Server(httpServer, {
  cors: {
    origin: "http://localhost:56890",
    methods: ["GET", "POST"]
  }
})

const app = new WebCaveServer(socketServer, Config.MAX_PLAYERS, Config.ONE_USER_PER_IP)
httpServer.listen(3000, function() {});
app.initSocketHandlers();
app.setWorld(world)

// Setup handlers
app.on("chat", chatHandler(app))
app.on("join", joinHandler(app))
app.on("leave", leaveHandler(app))

logger.log("Waiting for clients...")

setInterval( function() {
  world.saveToFile(Config.WORLD_FILE_NAME);
  logger.log( "Saved world to file." );
}, Config.SECONDS_BETWEEN_SAVES * 1000 );