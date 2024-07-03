import Vector from '../shared/vector.ts'
import { WebGl } from '@acid-info/webcave-client/src/types/gl.ts'

export interface IRenderer {
  onBlockChanged: (x: number, y: number, z: number) => void;
  gl: WebGl;
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
  update(): void;
  getEyePos(): Vector;
}