import WebCaveServer from '../server'
import { HandlerByEvent } from '../types/handlers'

export const joinHandler = (server: WebCaveServer): HandlerByEvent<"join"> => (client, nickname) => {
  server.sendMessage( "Welcome! Enjoy your stay, " + nickname + "!", client );
  server.broadcastMessage( nickname + " joined the game.", client );
}

export const leaveHandler = (server: WebCaveServer): HandlerByEvent<"leave"> => (nickname) => {
  server.sendMessage( nickname + " left the game." );
}