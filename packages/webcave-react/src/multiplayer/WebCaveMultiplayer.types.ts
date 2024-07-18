import { World } from '@acid-info/webcave-core/src'
import { Player, Renderer } from '@acid-info/webcave-client/src'
import { TexturePack } from '../types/texture'

export type WebCaveMultiplayerProps = {
  selectorWidthPx?: number
  chunkSize: number
  serverUrl: string
  texturePack: TexturePack
  width?: string
  height?: string
}

export type WebCaveMultiplayerState = {
  world: World
  renderer: Renderer
  player: Player
}