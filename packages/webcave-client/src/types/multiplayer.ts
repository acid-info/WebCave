import { Block, Material, World } from '@acid-info/webcave-core/src'
import { Socket } from 'socket.io-client'

export type OnConnect = () => void;
export type OnDisconnect = () => void;
export type OnWorld = (w: World) => void;
export type OnSpawn = () => void;
export type OnBlock = (x: number, y: number, z: number, b: Block, m: Material) => void;
export type OnChat = (user: string, msg: string) => boolean;
export type OnMessage = (msg: string) => void;
export type OnKick = (msg: string) => void;
export type OnJoin = (socket: Socket, nickname: string) => void;
export type OnLeave =(nickname: string) => void;

export type HandlerByMultiplayerEvent<E> =
  E extends "connect" ? OnConnect :
  E extends "disconnect" ? OnDisconnect :
  E extends "world" ? OnWorld :
  E extends "spawn" ? OnSpawn :
  E extends "block" ? OnBlock :
  E extends "chat" ? OnChat :
  E extends "message" ? OnMessage :
  E extends "kick" ? OnKick :
  E extends "join" ? OnJoin :
  E extends "leave" ? OnLeave :
  never;

export type MultiplayerEvents =
  "connect" |
  "disconnect" |
  "world" |
  "spawn" |
  "block" |
  "chat" |
  "message" |
  "kick" |
  "join" |
  "leave"