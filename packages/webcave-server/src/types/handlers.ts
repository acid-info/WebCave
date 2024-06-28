import { Socket } from 'socket.io'

type OnJoin = (socket: Socket, nickname: string) => void;
type OnChat = (socket: Socket, nickname: string, msg: string) => boolean;
type OnLeave = (nickname: string) => void;

export type HandlerByEvent<E extends HandlerEvents> =
  E extends "join" ? OnJoin :
  E extends "chat" ? OnChat :
  E extends "leave" ? OnLeave :
  never;

export type HandlerEvents =
  "join" |
  "chat" |
  "leave"

export type EventHandlersMap = { [K in HandlerEvents]?: HandlerByEvent<K> }
