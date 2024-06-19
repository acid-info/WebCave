export type Chunk = {
  start: ChunkSize,
  end: ChunkSize,
  dirty: boolean,
  buffer?: any
}

export type ChunkSize = [
  x: number,
  y: number,
  z: number
]