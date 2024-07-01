import ServerWorld from './game/world.ts'
import Config from './config'
import logger from './utils/logger.ts'
import { Server as SocketServer } from 'socket.io'
import WebCaveServer from './server.ts'
import { Server } from "http";
import { chatHandler } from './handlers/chat.ts'
import { joinHandler, leaveHandler } from './handlers/network.ts'
import World from './game/world.ts'

function initWorld() {
  const world = new ServerWorld(
    Config.WORLD_SX,
    Config.WORLD_SY,
    Config.WORLD_SZ
  );

  logger.info( "Creating world..." );

  if (world.loadFromFile(Config.WORLD_FILE_NAME)) {
    logger.info( "Loaded the world from file." );
  } else {
    logger.info( "Creating a new empty world." );
    world.createFlatWorld( Config.WORLD_GROUNDHEIGHT );
    world.saveToFile(Config.WORLD_FILE_NAME);
  }

  return world;
}

function app(socketServer: SocketServer, httpServer: Server): { world: World, webCaveServer: WebCaveServer } {
  const world = initWorld()

  const webCaveServer = new WebCaveServer(socketServer, Config.MAX_PLAYERS, Config.ONE_USER_PER_IP)
  httpServer.listen(3000, function() {});
  webCaveServer.initSocketHandlers();
  webCaveServer.setWorld(world)

  // Setup handlers
  webCaveServer.on("chat", chatHandler(webCaveServer))
  webCaveServer.on("join", joinHandler(webCaveServer))
  webCaveServer.on("leave", leaveHandler(webCaveServer))

  logger.info("Waiting for clients...")

  return { world, webCaveServer }
}

export default app;