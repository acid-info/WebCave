import { World } from '@acid-info/webcave-core/src'
import { Player, Renderer } from '@acid-info/webcave-client/src'
import { TexturePack } from '../types/texture'

export type WebCaveMultiplayerProps = {
  selectorWidthPx?: number
  chunkSize: number
  serverUrl: string
  texturePack: TexturePack
}

export type WebCaveMultiplayerState = {
  world: World
  renderer: Renderer
  player: Player
}