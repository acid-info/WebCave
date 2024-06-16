import Vector from './shared/vector'
import { MATERIALS } from './material'
import { EMaterial, Material } from './types/material'
import Block from './block'
import Renderer from './renderer'

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
  public readonly sx: number;
  public readonly sy: number;
  public readonly sz: number;
  public readonly blocks: Material[][][];

  public spawnPoint: Vector;
  public renderer: Renderer;

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

  /*
  * Sets up the world so that the bottom half is filled with dirt
  * and the top half with air.
  * */
  public createFlatWorld(height: number) {
    this.spawnPoint = new Vector( this.sx / 2 + 0.5, this.sy / 2 + 0.5, height );

    for ( var x = 0; x < this.sx; x++ )
      for ( var y = 0; y < this.sy; y++ )
        for ( var z = 0; z < this.sz; z++ )
          this.blocks[x][y][z] = z < height ? MATERIALS[EMaterial.DIRT] : MATERIALS[EMaterial.AIR];
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
    let blockArray = [];

    for ( let x = 0; x < this.sx; x++ )
      for ( let y = 0; y < this.sy; y++ )
        for ( let z = 0; z < this.sz; z++ )
          blockArray.push(String.fromCharCode(97 + this.blocks[x][y][z].id));

    return blockArray.join( "" );
  }
}

export default World;