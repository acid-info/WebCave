import {
  World
} from '@acid-info/webcave-core/src/index'

import {
  Renderer,
  Player
} from "@acid-info/webcave-client/src/index"

export type WebCaveGameState = {
  world: World
  renderer: Renderer
  player: Player
}

export type WebCaveProps = {
  selectorWidthPx?: number,
  worldString?: string,
  worldSize: number,
  chunkSize: number
}