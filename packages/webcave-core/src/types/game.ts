export interface IRenderer {
  onBlockChanged: (x: number, y: number, z: number) => void;
}

export interface IPlayer {
  moving: boolean,
  aniframe: number,
  pitch: number,
  x: number,
  y: number,
  z: number,
  yaw: number,
  nick: string,
  nametag: any
}