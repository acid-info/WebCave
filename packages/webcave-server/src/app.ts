import ServerWorld from './game/world'
import Config from './config'
import logger from './utils/logger'
import { Server as SocketServer } from 'socket.io'
import WebCaveServer from './server'
import { Server } from "http";
import { chatHandler } from './handlers/chat'
import { joinHandler, leaveHandler } from './handlers/network'
import World from './game/world'

function initWorld() {
  const world = new ServerWorld(
    Config.WORLD_SX,
    Config.WORLD_SY,
    Config.WORLD_SZ,
    Config.WORLD_FILE_NAME,
    Config.WORLD_FILE_FOLDER
  );

  logger.info( "Creating world..." );

  if (world.loadFromFile()) {
    logger.info( "Loaded the world from file." );
  } else {
    if (Config.USE_FALLBACK_DEFAULT_WORLD) {
      logger.info( "Creating a new world from a template of default world." );

      world.loadFromFile(world.getDefaultWorldFilePath())
    } else {
      logger.info( "Creating a new empty world." );

      const defaultWorldSeed = "acid-info";
      const magnitude = 0.1;

      world.createRandomisedWorld(
        Config.WORLD_GROUNDHEIGHT, defaultWorldSeed, undefined, magnitude
      );
    }

    world.prepareNewSaveDir()
    world.saveToFile();
  }

  return world;
}

function app(socketServer: SocketServer, httpServer: Server): { world: World, webCaveServer: WebCaveServer } {
  const world = initWorld()

  const webCaveServer = new WebCaveServer(socketServer, Config.MAX_PLAYERS, Config.ONE_USER_PER_IP)
  httpServer.listen(Config.PORT, function() {});
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