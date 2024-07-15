import Vector from '../shared/vector'

export interface IRenderer<GLContext = any> {
  onBlockChanged: (x: number, y: number, z: number) => void;
  gl: GLContext;
}

export interface IPlayer {
  socket?: any;
  moving: boolean;
  aniframe: number;
  pitch: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  nick: string;
  nametag: any;
  pos: Vector;
  angles: number[];
  velocity: Vector;
  blocks?: number;
  lastBlockCheck?: number;
  lastUpdate: number;
  update(): void;
  getEyePos(): Vector;
}