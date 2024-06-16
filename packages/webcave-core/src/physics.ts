import World from './world'
import { MATERIALS } from './material'
import { EMaterial } from './types/material'

/*
* Physics
* This class contains the code that takes care of simulating
* processes like gravity and fluid flow in the world.
* */
class Physics {
  public lastStep: number;

  public world: World;

  constructor() {
    this.lastStep = -1;
  }

  /*
  * Assigns a world to simulate to this physics simulator
  * */
  public setWorld(world: World) {
    this.world = world;
  }

  /*
  * Perform one iteration of physics simulation.
  * Should be called about once every second.
  * */
  public simulate() {
    let world = this.world;
    let blocks = world.blocks;

    let step = Math.floor( new Date().getTime() / 100);
    if (step == this.lastStep) {
      return;
    }
    this.lastStep = step;

    // Gravity
    if ( step % 1 == 0 ) {
      for (let x = 0; x < world.sx; x++) {
        for (let y = 0; y < world.sy; y++) {
          for (let z = 0; z < world.sz; z++) {
            if (blocks[x][y][z].gravity && z > 0 && blocks[x][y][z-1] == MATERIALS[EMaterial.AIR]) {
              world.setBlock( x, y, z - 1, blocks[x][y][z]);
              world.setBlock( x, y, z, MATERIALS[EMaterial.AIR]);
            }
          }
        }
      }
    }
  }
}

export default Physics;