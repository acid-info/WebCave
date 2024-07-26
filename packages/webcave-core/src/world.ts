import Vector from './shared/vector'
import { MATERIALS } from './material'
import { EMaterial, Material } from './types/material'
import Block from './block'
import { IPlayer as Player, IRenderer as Renderer } from './types/game'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

/*
* World container
*
* This class contains the elements that make up the game world.
* Other modules retrieve information from the world or alter it
* using this class.
* ==========================================
*
* Constructor( sx, sy, sz )
*
* Creates a new world container with the specified world size.
* Up and down should always be aligned with the Z-direction.
*
* sx - World size in the X-direction.
* sy - World size in the Y-direction.
* sz - World size in the Z-direction.
* */
class World {
  public readonly DEFAULT_SCALE = 30;
  public readonly DEFAULT_MAGNITUDE = 0.15;
  public readonly DEFAULT_OFFSET = 0.8;

  public readonly sx: number;
  public readonly sy: number;
  public readonly sz: number;
  public readonly blocks: Material[][][];

  public spawnPoint: Vector;
  public renderer: Renderer;

  public localPlayer: Player;
  public players: Player[] = [];

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

  public createRandomisedWorld(
    height: number,
    seed?: string,
    scale: number = this.DEFAULT_SCALE,
    magnitude: number = this.DEFAULT_MAGNITUDE,
    offset: number = this.DEFAULT_OFFSET,
  ) {
    this.spawnPoint = new Vector( this.sx / 2 + 0.5, this.sy / 2 + 0.5, height );

    let blockIds: EMaterial[][][] = new Array(this.sx);
    for (let x = 0; x < this.sx; x++) {
      blockIds[x] = new Array(this.sy);
      for (let y = 0; y < this.sy; y++) {
        blockIds[x][y] = new Array(this.sz);
        for (let z = 0; z < this.sz; z++) {
          blockIds[x][y][z] = EMaterial.AIR;
        }
      }
    }

    const simplex = seed ? createNoise2D(alea(seed)) : createNoise2D();
    for (let x = 0; x < this.sx; x++) {
      for (let y = 0; y < this.sy; y++) {
        const value = simplex(x / scale, y / scale);

        const scaledNoise = offset + magnitude * value;

        const h = height * scaledNoise;
        const amortizeH = Math.max(0, Math.min(h, height));
        const bottomBlockHeight = amortizeH * 0.8;

        for (let z = 0; z < amortizeH; z++) {
          let materialId: EMaterial;

          if (z === 0) {
            materialId = EMaterial.BEDROCK
          } else if (z > 0 && z < bottomBlockHeight) {
            materialId = EMaterial.CONCRETE
          } else {
            materialId = EMaterial.DIRT
          }

          blockIds[x][y][z] = materialId;
        }
      }
    }

    for (let x = 0; x < this.sx; x++) {
      for (let y = 0; y < this.sy; y++) {
        for (let z = 0; z < this.sz; z++) {
          this.blocks[x][y][z] = MATERIALS[blockIds[x][y][z]];
        }
      }
    }
  }

  /*
  * Sets up the world so that the bottom half is filled with dirt
  * and the top half with air.
  * */
  public createFlatWorld(height: number) {
    this.spawnPoint = new Vector( this.sx / 2 + 0.5, this.sy / 2 + 0.5, height );

    for ( let x = 0; x < this.sx; x++ ) {
      for ( let y = 0; y < this.sy; y++ ) {
        for ( let z = 0; z < this.sz; z++ ) {
          this.blocks[x][y][z] = z < height ? MATERIALS[EMaterial.DIRT] : MATERIALS[EMaterial.AIR];
        }
      }
    }
  }

  /*
  * Creates a world from a string representation.
  * This is the opposite of toNetworkString().
  * NOTE: The world must have already been created
  * with the appropriate size!
  * */
  public createFromString(str: string) {
    const [spawnX, spawnY, spawnZ, world] = str.split(",")
    this.spawnPoint = new Vector(Number(spawnX), Number(spawnY), Number(spawnZ));
    let i = 0;

    for ( let x = 0; x < this.sx; x++ ) {
      for ( let y = 0; y < this.sy; y++ ) {
        for ( let z = 0; z < this.sz; z++ ) {
          this.blocks[x][y][z] = Block.fromId( world.charCodeAt( i ) - 97 );
          i = i + 1;
        }
      }
    }
  }

  /*
  * Get the type of the block at the specified position.
  * Mostly for neatness, since accessing the array
  * directly is easier and faster.
  * */
  public getBlock(x: number, y: number, z: number) {
    if ( x < 0 || y < 0 || z < 0 || x > this.sx - 1 || y > this.sy - 1 || z > this.sz - 1 ) {
      return MATERIALS[EMaterial.AIR]
    }
    return this.blocks[x][y][z];
  }

  /*
  * Set the block at specified position and trigger any hooks
  * */
  public setBlock(x: number, y: number, z: number, type: Material) {
    this.blocks[x][y][z] = type;
    if ( this.renderer != null ) {
      this.renderer.onBlockChanged( x, y, z )
    }
  }

  /*
  * Returns a string representation of this world.
  * */
  public toNetworkString() {
    let blockArray: string[] = [];

    for ( let x = 0; x < this.sx; x++ )
      for ( let y = 0; y < this.sy; y++ )
        for ( let z = 0; z < this.sz; z++ )
          blockArray.push(String.fromCharCode(97 + this.blocks[x][y][z].id));

    return blockArray.join( "" );
  }

  public setLocalPlayer(player: Player) {
    this.localPlayer = player;
  }
}

export default World;