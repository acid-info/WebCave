import {
  Physics,
  World
} from '@acid-info/webcave-core/src/index.ts'

import {
  Renderer,
  Player
} from "@acid-info/webcave-client/src/index.ts"

export type WebCaveGameState = {
  world: World
  renderer: Renderer
  physics: Physics
  player: Player
}

export type WebCaveProps = {
  selectorWidthPx?: number,
  worldString?: string,
  worldSize: number,
  chunkSize: number
}