import {
  Physics,
  World,
  Renderer,
  Player
} from '@acid-info/webcave-core/src'

export type WebCaveGameState = {
  world: World
  renderer: Renderer
  physics: Physics
  player: Player
}
