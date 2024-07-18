import {
  World
} from '@acid-info/webcave-core/src/index'

import {
  Renderer,
  Player
} from '@acid-info/webcave-client/src'
import { TexturePack } from '../types/texture'

export type WebCaveGameState = {
  world: World
  renderer: Renderer
  player: Player
}

export type WebCaveProps = {
  selectorWidthPx?: number,
  worldString?: string,
  worldSize: number,
  chunkSize: number,
  texturePack: TexturePack
}