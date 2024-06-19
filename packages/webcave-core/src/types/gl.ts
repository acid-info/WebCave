export type Square = {
  x: number,
  y: number,
  size: number
}

export type Rectangle = {
  x1: number,
  x2: number,
  y1: number,
  y2: number
}

export interface HorizontalLine {
  x?: never,
  y: number,
  x1: number,
  x2: number,
  y1?: never,
  y2?: never
}

export interface VerticalLine {
  x: number,
  y?: never,
  x1?: never,
  x2?: never,
  y1: number,
  y2: number
}

export type Line = HorizontalLine | VerticalLine

export type DirectedLine = Line & {
  dir: number;
}

export type Collision = {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  z: number,
  dir: number
}