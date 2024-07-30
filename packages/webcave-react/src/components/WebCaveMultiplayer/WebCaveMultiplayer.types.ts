import { World } from '@acid-info/webcave-core/src/index'
import { Player, Renderer } from '@acid-info/webcave-client/src/index'
import { TexturePack } from '../../types/texture'

export type WebCaveMultiplayerProps = {
  selectorWidthPx?: number
  chunkSize: number
  serverUrl: string
  texturePack: TexturePack
  width?: string
  height?: string
  acid?: boolean
}