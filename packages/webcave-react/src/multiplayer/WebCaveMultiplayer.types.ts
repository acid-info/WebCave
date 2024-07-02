import { World } from '@acid-info/webcave-core/src'
import { Player, Renderer } from '@acid-info/webcave-client/src'

export type WebCaveMultiplayerProps = {
  selectorWidthPx?: number
  chunkSize: number
  serverUrl: string
}

export type WebCaveMultiplayerState = {
  world: World
  renderer: Renderer
  player: Player
}