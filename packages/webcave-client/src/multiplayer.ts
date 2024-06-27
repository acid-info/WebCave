import { Socket, io } from 'socket.io-client'
import { EventHandlersMap, HandlerByMultiplayerEvent, MultiplayerEvents } from './types/multiplayer.ts'
import {
  SocketEmitterPayloadMap,
  SocketClientEvents,
  SocketServerEvents,
  PayloadBySocketEvent, Vector, Block,
} from '@acid-info/webcave-core/src'
import { World } from '@acid-info/webcave-core/src'


class MultiplayerClient {
  public socket: Socket<
    SocketEmitterPayloadMap<SocketServerEvents | SocketClientEvents>,
    SocketEmitterPayloadMap<SocketClientEvents>
  >;
  public eventHandlers: EventHandlersMap;

  public kicked: boolean;
  public nickname: string;
  public world: World;

  constructor() {
    this.eventHandlers = {};
    this.kicked = false;
  }

  public connect(uri: string, nickname: string) {
    this.socket = io(uri, {
      reconnection: false,
      transports: ['polling', 'websocket']
    })

    this.nickname = nickname;

    this.socket.on( "connect", this.onConnection);
    this.socket.on( "disconnect", this.onDisconnection);
    this.socket.on( "world", this.onWorld);
    this.socket.on( "spawn", this.onSpawn);
    this.socket.on( "setblock", this.onBlockUpdate);
    this.socket.on( "msg", this.onMessage);
    this.socket.on( "kick", this.onKick);
    this.socket.on( "join", this.onPlayerJoin);
    this.socket.on( "leave", this.onPlayerLeave);
    this.socket.on( "player", this.onPlayerUpdate);
    this.socket.on( "setpos", this.onPlayerSetPos);
  }

  public setBlock(x: number,y: number,z: number, mat ) {
    this.socket.emit('setblock', {
      x: x,
      y: y,
      z: z,
      mat: mat.id
    });
  }

  public sendMessage(msg: string) {
    this.socket.emit( "chat", {
      msg: msg
    });
  }

  public updatePlayer() {
    let player = this.world.localPlayer;

    this.socket.emit( "player", {
      x: player.pos.x,
      y: player.pos.y,
      z: player.pos.z,
      pitch: player.angles[0],
      yaw: player.angles[1]
    });
  }

  public on<E extends MultiplayerEvents>(event: E, callback: HandlerByMultiplayerEvent<E>) {
    // We are sure it's typed out properly by params of the function
    // but to keep typification simple, we'll explicitly type here as "any"
    this.eventHandlers[event] = callback as any;
  }

  public onConnection() {
    if ( this.eventHandlers.connect ) {
      this.eventHandlers.connect();
    }

    this.socket.emit( "nickname", {
      nickname: this.nickname
    });
  }

  public onDisconnection() {
    if ( this.eventHandlers.disconnect ) {
      this.eventHandlers.disconnect(this.kicked);
    }
  }

  public onWorld(data: PayloadBySocketEvent<"world">) {
    // Create world from string representation
    this.world = new World(data.sx, data.sy, data.sz);
    this.world.createFromString(data.blocks);

    if ( this.eventHandlers.world ) {
      this.eventHandlers.world(this.world);
    }
  }

  public onSpawn(data: PayloadBySocketEvent<"spawn">) {
    // Set spawn point
    this.world.spawnPoint = new Vector( data.x, data.y, data.z );

    if (this.eventHandlers.spawn) {
      this.eventHandlers.spawn();
    }
  }

  public onBlockUpdate(data: PayloadBySocketEvent<"setblock">) {
    const material = Block.fromId( data.mat );

    if (this.eventHandlers.block) {
      this.eventHandlers.block(
        data.x,
        data.y,
        data.z,
        this.world.blocks[data.x][data.y][data.z],
        material
      );
    }

    this.world.setBlock(data.x, data.y, data.z, material);
  }

  public onMessage(data: PayloadBySocketEvent<"msg">)
  {
    if ( data.type == "chat" ) {
      if ( this.eventHandlers["chat"] ) {
        this.eventHandlers.chat(data.user, data.msg);
      }
    } else if ( data.type == "generic" ) {
      if ( this.eventHandlers.message ) {
        this.eventHandlers.message(data.msg);
      }
    }
  }

  public onKick(data: PayloadBySocketEvent<"kick">) {
    this.kicked = true;
    if ( this.eventHandlers.kick ) {
      this.eventHandlers.kick(data.msg);
    }
  }

  public onPlayerJoin(data: PayloadBySocketEvent<"join">) {
    this.world.players[data.nick] = {
      ...data,
      moving: false,
      aniframe: 0
    };
  }

  public onPlayerLeave(data:PayloadBySocketEvent<"leave">) {
    if ( this.world.players[data.nick].nametag ) {
      this.world.renderer.gl.deleteBuffer( this.world.players[data.nick].nametag.model );
      this.world.renderer.gl.deleteTexture( this.world.players[data.nick].nametag.texture );
    }

    delete this.world.players[data.nick];
  }

  public onPlayerUpdate(data: PayloadBySocketEvent<"player">) {
    if (!this.world) {
      return;
    }

    let pl = this.world.players[data.nick];
    if ( Math.abs(data.x - pl.x) > 0.1 ||
      Math.abs(data.y - pl.y) > 0.1 ||
      Math.abs(data.z - pl.z) > 0.1) {
      pl.moving = true;
    }

    pl.x = data.x;
    pl.y = data.y;
    pl.z = data.z;
    pl.pitch = data.pitch;
    pl.yaw = data.yaw;
    window.setTimeout(function(){
      pl.moving=false
    },100);
  }

  public onPlayerSetPos(data:PayloadBySocketEvent<"setpos">) {
    this.world.localPlayer.pos = new Vector( data.x, data.y, data.z );
    this.world.localPlayer.velocity = new Vector( 0, 0, 0 );
  }
}

export default MultiplayerClient;