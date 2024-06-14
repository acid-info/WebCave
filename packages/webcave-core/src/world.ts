import Vector from './shared/vector'
import { MATERIALS } from './material'
import { EMaterial, Material } from './types/material'

class World {
  public readonly sx: number;
  public readonly sy: number;
  public readonly sz: number;

  public readonly blocks: Material[][][];
  public spawnPoint: Vector;

  constructor(sx: number, sy: number, sz: number) {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;

    this.blocks = new Array(sx);
    for ( let x = 0; x < sx; x++ ) {
      this.blocks[x] = new Array( sy );

      for ( let y = 0; y < sy; y++ ) {
        this.blocks[x][y] = new Array( sz );
      }
    }
  }

  public createFlatWorld(height: number) {
    this.spawnPoint = new Vector( this.sx / 2 + 0.5, this.sy / 2 + 0.5, height );

    for ( var x = 0; x < this.sx; x++ )
      for ( var y = 0; y < this.sy; y++ )
        for ( var z = 0; z < this.sz; z++ )
          this.blocks[x][y][z] = z < height ? MATERIALS[EMaterial.DIRT] : MATERIALS[EMaterial.AIR];
  }
}

export default World;