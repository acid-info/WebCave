import { HandlerByEvent } from '../types/handlers'
import WebCaveServer from '../server'
import { getIp } from '../utils/network'
import Config from '../config'

export const chatHandler = (server: WebCaveServer): HandlerByEvent<"chat"> => (client, nickname, msg ) => {
  if ( msg == "/spawn" ) {
    server.setPos(
      client,
      server.world.spawnPoint.x,
      server.world.spawnPoint.y,
      server.world.spawnPoint.z
    );

    return true;
  } else if ( msg.substring( 0, 3 ) == "/tp" ) {
    const userName = msg.substring( 4 );
    const target = server.findPlayerByName(userName);

    if ( target != null ) {
      server.setPos( client, target.x, target.y, target.z );
      server.sendMessage( nickname + " was teleported to " + target.nick + "." );
      return true;
    } else {
      server.sendMessage( "Couldn't find that player!", client );
      return false;
    }
  } else if ( msg.substring( 0, 5 ) == "/kick" && getIp(client) == Config.ADMIN_IP ) {
    const username = msg.substring( 6 );
    const target = server.findPlayerByName( username );

    if ( target != null ) {
      server.kick( target.socket, "Kicked by Admin" );
      return true;
    } else {
      server.sendMessage( "Couldn't find that player!", client );
      return false;
    }
  } else if ( msg == "/list" ) {
    let playerlist = "";
    for (let p in server.world.players ) {
      playerlist += p + ", ";
    }

    playerlist = playerlist.substring( 0, playerlist.length - 2 );
    server.sendMessage( "Players: " + playerlist, client );
    return true;
  } else if ( msg.substring( 0, 1 ) == "/" ) {
    server.sendMessage( "Unknown command!", client );
    return false;
  }

  return false;
}