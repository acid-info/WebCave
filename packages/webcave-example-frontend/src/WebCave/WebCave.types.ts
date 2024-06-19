import {
  Physics,
  World
} from '@acid-info/webcave-core/src'

import {
  Renderer,
  Player
} from "@acid-info/webcave-client/src"

export type WebCaveGameState = {
  world: World
  renderer: Renderer
  physics: Physics
  player: Player
}
