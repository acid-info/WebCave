import { Server, Socket } from 'socket.io'
import { EventHandlersMap, HandlerByEvent, HandlerEvents } from './types/handlers.ts'
import {
  Block,
  PayloadBySocketEvent,
  SocketClientEvents,
  SocketEmitterPayloadMap,
  SocketServerEvents,
  World,
} from '@acid-info/webcave-core/src'
import logger from './utils/logger.ts'
import { getIp, sanitiseInput } from './utils/network.ts'
import Config from './config'
import { normaliseAngle } from './utils/math.ts'

type GameSocket = Socket<
  SocketEmitterPayloadMap<SocketClientEvents>,
  SocketEmitterPayloadMap<SocketServerEvents>
>

class WebCaveServer {
  public io: Server<
    SocketEmitterPayloadMap<SocketClientEvents>,
    SocketEmitterPayloadMap<SocketServerEvents>
  >;
  public maxSlots: number;
  public usedSlots: number;
  public oneUserPerIp: boolean;

  public activeNicknames: { [nickname: string]: boolean };
  public activeAddresses: { [ipAddress: string]: boolean };

  public eventHandlers: EventHandlersMap;

  public world: World;

  constructor(io: Server, slots: number, oneUserPerIp: boolean) {
    this.io = io;
    this.maxSlots = slots;
    this.usedSlots = 0;
    this.oneUserPerIp = oneUserPerIp;
    this.eventHandlers = {};
    this.activeAddresses = {};
    this.activeNicknames = {};
  }

  public initSocketHandlers() {
    this.io.sockets.on( "connection", (socket) => {
      this.onConnection(socket)
    });
  }

  public setWorld(world: World) {
    this.world = world;
  }

  public on<E extends HandlerEvents>(event: E, callback: HandlerByEvent<E>) {
    // We are sure it's typed out properly by params of the function
    // but to keep typification simple, we'll explicitly type here as "any"
    this.eventHandlers[event] = callback as any;
  }

  public sendMessage(msg: string, socket?: GameSocket) {
    // If no client specified, broadcast to everyone
    if (socket) {
      socket.emit("msg", {
        type: "generic",
        msg
      })
    } else {
      this.io.sockets.emit("msg", {
        type: "generic",
        msg
      })
    }
  }

  /*
  * Send a generic message to everyone except for the
  * specified client.
  * */
  public broadcastMessage(msg: string, socket: GameSocket) {
    socket.broadcast.emit( "msg", {
      type: "generic",
      msg: msg
    });
  }

  public kick(socket: GameSocket, msg: string) {
    const ipAddress = getIp(socket, Config.IS_BEHIND_PROXY)
    logger.info(`Client ${ipAddress} was kicked ( ${msg} ).`)

    if (socket.data._nickname) {
      this.sendMessage( socket.data._nickname + ` was kicked ( ${msg} ).` );
    }

    socket.emit( "kick", { msg });
    socket.disconnect();
  }

  public setPos(socket: GameSocket, x: number, y: number, z: number) {
    socket.emit("setpos", { x, y, z });
  }

  public findPlayerByName(name: string) {
    for ( let p in this.world.players ) {
      if ( p.toLowerCase().indexOf( name.toLowerCase() ) != -1 ) {
        return this.world.players[p];
      }
    }
    return null;
  }

  public onConnection(socket: GameSocket) {
    const ipAddress = getIp(socket)

    logger.info( `Client ${ipAddress} connected to the server.` );

    // Check if a slot limit is active
    if (this.usedSlots === this.maxSlots ) {
      this.kick(socket, "The server is full!" );
      return;
    }

    // Prevent people from blocking the server with multiple open clients
    if ( this.activeAddresses[ipAddress] && this.oneUserPerIp ) {
    	this.kick(socket, "Multiple clients connecting from the same IP address!" );
    	return;
    }
    this.activeAddresses[ipAddress] = true;
    this.usedSlots++;

    socket.on( "nickname", (data) => { this.onNickname(socket, data) });
    socket.on( "setblock", (data) => { this.onBlockUpdate(socket, data) });
    socket.on( "chat", (data) => { this.onChatMessage(socket, data) });
    socket.on( "player", (data) => { this.onPlayerUpdate(socket, data) });
    socket.on( "disconnect", () => { this.onDisconnect(socket) });
  }

  public onNickname(socket: GameSocket, data: PayloadBySocketEvent<"nickname">): boolean {
    if ( data.nickname.length == 0 || data.nickname.length > 15 ) {
      return false;
    }

    // Prevent people from changing their username
    if (!socket.data._nickname) {
      let nickname = sanitiseInput( data.nickname );

      for (let n in this.activeNicknames ) {
        if ( n.toLowerCase() == nickname.toLowerCase() ) {
          this.kick( socket, "That username is already in use!" );
          return false;
        }
      }

      logger.info( `Client ${getIp(socket)} is now known as ${nickname}.`);
      if ( this.eventHandlers["join"] ) {
        this.eventHandlers.join(socket, nickname);
      }
      this.activeNicknames[data.nickname] = true;

      // Associate nickname with socket
      socket.data._nickname = nickname;

      // Send world to client
      socket.emit( "world", {
        sx: this.world.sx,
        sy: this.world.sy,
        sz: this.world.sz,
        blocks: this.world.toNetworkString()
      } );

      // Spawn client
      socket.emit( "spawn", {
        x: this.world.spawnPoint.x,
        y: this.world.spawnPoint.y,
        z: this.world.spawnPoint.z,
      } );

      // Tell client about other players
      for (let p in this.world.players ) {
        let pl = this.world.players[p];

        socket.emit( "join", {
          nick: p,
          x: pl.x,
          y: pl.y,
          z: pl.z,
          pitch: pl.pitch,
          yaw: pl.yaw
        } );
      }

      // Inform other players
      socket.broadcast.emit( "join", {
        nick: nickname,
        x: this.world.spawnPoint.x,
        y: this.world.spawnPoint.y,
        z: this.world.spawnPoint.z,
        pitch: 0,
        yaw: 0
      } );

      // Add player to world
      this.world.players[nickname] = {
        socket: socket,
        nick: nickname,
        lastBlockCheck: +new Date(),
        blocks: 0,
        x: this.world.spawnPoint.x,
        y: this.world.spawnPoint.y,
        z: this.world.spawnPoint.z,
        pitch: 0,
        yaw: 0
      };

      return true;
    }

    return false;
  }

  public onBlockUpdate(socket: GameSocket, data: PayloadBySocketEvent<"setblock">) {
    const isIncorrectDataFormat = typeof( data.x ) != "number" || typeof( data.y ) != "number" || typeof( data.z ) != "number" || typeof( data.mat ) != "number";
    if (isIncorrectDataFormat) {
      return false;
    }

    const isOutOfBounds = data.x < 0 || data.y < 0 || data.z < 0 || data.x >= this.world.sx || data.y >= this.world.sy || data.z >= this.world.sz;
    if (isOutOfBounds) {
      return false;
    }

    const spawnPointBlockSize = 10;
    const isSpawnPoint = (Math.sqrt(
      (data.x - this.world.spawnPoint.x) * (data.x - this.world.spawnPoint.x) + (data.y - this.world.spawnPoint.y) * (data.y - this.world.spawnPoint.y) + (data.z - this.world.spawnPoint.z) * (data.z - this.world.spawnPoint.z)
    ) < spawnPointBlockSize);

    if (isSpawnPoint) {
      return false;
    }

    const material = Block.fromId(data.mat);
    if (material === null || (!material.spawnable && data.mat != 0)) {
      return false;
    }

    // Check if the user has authenticated themselves before allowing them to set blocks
    if (socket.data._nickname) {
      try {
        this.world.setBlock( data.x, data.y, data.z, material);

        let pl = this.world.players[socket.data._nickname];
        pl.blocks++;

        if (+new Date() > pl.lastBlockCheck + 100) {
          if ( pl.blocks > 5 ) {
            this.kick( socket, "Block spamming." );
            return false;
          }

          pl.lastBlockCheck = +new Date();
          pl.blocks = 0;
        }

        this.io.sockets.emit( "setblock", {
          x: data.x,
          y: data.y,
          z: data.z,
          mat: data.mat
        } );
      } catch ( e ) {
        logger.warn( `Error setting block at ( ${data.x}, ${data.y}, ${data.z} ): `, e);
      }
    }

    return true;
  }

  public onChatMessage(socket: GameSocket, data: PayloadBySocketEvent<"chat">) {
    if ( typeof( data.msg ) != "string" || data.msg.trim().length == 0 || data.msg.length > 100 ) {
      return false;
    }

    let msg = sanitiseInput( data.msg );

    // Check if the user has authenticated themselves before allowing them to send messages
    if (socket.data._nickname) {
      logger.log( `< ${socket.data._nickname} > ` + msg);

      let callback = false;
      if (this.eventHandlers["chat"]) {
        callback = this.eventHandlers.chat(socket, socket.data._nickname, msg)
      }

      if ( !callback ) {
        this.io.sockets.emit( "msg", {
          type: "chat",
          user: socket.data._nickname,
          msg: msg
        });
      }
    }

    return true;
  }
  
  public onPlayerUpdate(socket: GameSocket, data: PayloadBySocketEvent<"player">) {
    const isIncorrectPositionFormat = typeof( data.x ) != "number" || typeof( data.y ) != "number" || typeof( data.z ) != "number";
    if (isIncorrectPositionFormat) {
      return false;
    }

    const isIncorrectAngleFormat = typeof( data.pitch ) != "number" || typeof( data.yaw ) != "number"
    if (isIncorrectAngleFormat) {
      return false;
    }

    // Check if the user has authenticated themselves before allowing them to send updates
    if (socket.data._nickname) {
      let pl = this.world.players[socket.data._nickname];
      pl.x = data.x;
      pl.y = data.y;
      pl.z = data.z;
      pl.pitch = data.pitch;
      pl.yaw = data.yaw;

      // Forward update to other players
      for (let p in this.world.players) {
        let tpl = this.world.players[p];

        if (tpl.socket === socket) {
          continue;
        }

        let ang = Math.PI + Math.atan2( tpl.y - pl.y, tpl.x - pl.x );
        let nyaw = Math.PI - tpl.yaw - Math.PI/2;
        let inFrustrum = Math.abs( normaliseAngle( nyaw ) - normaliseAngle( ang ) ) < Math.PI/2;

        if (inFrustrum) {
          tpl.socket.volatile.emit( "player", {
            nick: socket.data._nickname,
            x: pl.x,
            y: pl.y,
            z: pl.z,
            pitch: pl.pitch,
            yaw: pl.yaw
          });
        }
      }
    }

    return true;
  }

  public onDisconnect(socket: GameSocket) {
    logger.info( `Client ${getIp(socket)} disconnected.` );

    this.usedSlots--;
    delete this.activeAddresses[getIp(socket)];

    if (socket.data._nickname) {
      delete this.activeNicknames[socket.data._nickname];
      delete this.world.players[socket.data._nickname];

      // Inform other players
      socket.broadcast.emit( "leave", {
        nick: socket.data._nickname
      } );

      if ( this.eventHandlers["leave"] ) {
        this.eventHandlers.leave(socket.data._nickname);
      }
    }
  }
}

export default WebCaveServer;