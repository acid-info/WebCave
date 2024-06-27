import { Socket, io } from 'socket.io-client'
import { HandlerByMultiplayerEvent, MultiplayerEvents } from './types/multiplayer.ts'
import {
  SocketEventPayloadMap,
  SocketClientEvents,
  SocketServerEvents,
} from '@acid-info/webcave-core/src/types/multiplayer.ts'

class MultiplayerClient {
  public socket: Socket<
    SocketEventPayloadMap<SocketServerEvents>,
    SocketEventPayloadMap<SocketClientEvents>
  >;
  public eventHandlers: { [K in MultiplayerEvents]?: HandlerByMultiplayerEvent<K> };

  public kicked: boolean;
  public nickname: string;

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

    // this.socket.on( "connect", function() { s.onConnection(); } );
    // socket.on( "disconnect", function() { s.onDisconnection(); } );
    // socket.on( "world", function( data ) { s.onWorld( data ); } );
    // socket.on( "spawn", function( data ) { s.onSpawn( data ); } );
    // socket.on( "setblock", function( data ) { s.onBlockUpdate( data ); } );
    // socket.on( "msg", function( data ) { s.onMessage( data ); } );
    // socket.on( "kick", function( data ) { s.onKick( data ); } );
    // socket.on( "join", function( data ) { s.onPlayerJoin( data ); } );
    // socket.on( "leave", function( data ) { s.onPlayerLeave( data ); } );
    // socket.on( "player", function( data ) { s.onPlayerUpdate( data ); } );
    // socket.on( "setpos", function( data ) { s.onPlayerSetPos( data ); } );
  }

  public setBlock(x: number,y: number,z: number, mat ) {
    this.socket.emit('setblock', {
      x: x,
      y: y,
      z: z,
      mat: mat.id
    });
  }
}

export default MultiplayerClient;