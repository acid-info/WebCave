import { MATERIALS } from './material'
import { EMaterial } from './types/material'
import World from './world'
import { pushQuad } from './utils/math'
import { EDirection } from './types/controls'

class Block {
  public static fromId(id: EMaterial) {
    return MATERIALS[id]
  }

  public static pushVertices(vertices: number[], world: World, lightmap: any, x: number, y: number, z: number ) {
    let blocks = world.blocks;
    let blockLit = z >= lightmap[x][y];
    let block = blocks[x][y][z];
    let bH = block.fluid && ( z == world.sz - 1 || !blocks[x][y][z+1].fluid ) ? 0.9 : 1.0;

    // Top
    if ( z == world.sz - 1 || world.blocks[x][y][z+1].transparent || block.fluid ) {
      let c = block.texture({ world, lightmap, lit: blockLit, x, y, z, dir: EDirection.UP });

      let lightMultiplier = z >= lightmap[x][y] ? 1.0 : 0.6;
      if ( block.selflit ) lightMultiplier = 1.0;

      pushQuad(
        vertices,
        [ x, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z + bH, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y + 1.0, z + bH, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }

    // Bottom
    if ( z == 0 || world.blocks[x][y][z-1].transparent ) {
      let c = block.texture({world, lightmap, lit: blockLit, x, y, z, dir: EDirection.DOWN});

      let lightMultiplier = block.selflit ? 1.0 : 0.6;

      pushQuad(
        vertices,
        [ x, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y, z, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y, z, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }

    // Front
    if ( y == 0 || world.blocks[x][y-1][z].transparent ) {
      let c = block.texture({world, lightmap, lit: blockLit, x, y, z, dir: EDirection.FORWARD});

      let lightMultiplier = ( y == 0 || z >= lightmap[x][y-1] ) ? 1.0 : 0.6;
      if ( block.selflit ) lightMultiplier = 1.0;

      pushQuad(
        vertices,
        [ x, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }

    // Back
    if ( y == world.sy - 1 || world.blocks[x][y+1][z].transparent ) {
      let c = block.texture({world, lightmap, lit: blockLit, x, y, z, dir: EDirection.BACK});

      let lightMultiplier = block.selflit ? 1.0 : 0.6;

      pushQuad(
        vertices,
        [ x, y + 1.0, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }

    // Left
    if ( x == 0 || world.blocks[x-1][y][z].transparent ) {
      let c = block.texture({world, lightmap, lit: blockLit, x, y, z, dir: EDirection.LEFT});

      let lightMultiplier = block.selflit ? 1.0 : 0.6;

      pushQuad(
        vertices,
        [ x, y, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y + 1.0, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y + 1.0, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x, y, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }

    // Right
    if ( x == world.sx - 1 || world.blocks[x+1][y][z].transparent ) {
      let c = block.texture({world, lightmap, lit: blockLit, x, y, z, dir: EDirection.RIGHT});

      let lightMultiplier = ( x == world.sx - 1 || z >= lightmap[x+1][y] ) ? 1.0 : 0.6;
      if ( block.selflit ) lightMultiplier = 1.0;

      pushQuad(
        vertices,
        [ x + 1.0, y, z, c[0], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z, c[2], c[3], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y + 1.0, z + bH, c[2], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ],
        [ x + 1.0, y, z + bH, c[0], c[1], lightMultiplier, lightMultiplier, lightMultiplier, 1.0 ]
      );
    }
  }

  public static pushPickingVertices(vertices: number[], x: number, y: number, z: number) {
    let color = { r: x/255, g: y/255, b: z/255 };

    // Top
    pushQuad(
      vertices,
      [ x, y, z + 1, 0, 0, color.r, color.g, color.b, 1/255 ],
      [ x + 1, y, z + 1, 1, 0, color.r, color.g, color.b, 1/255 ],
      [ x + 1, y + 1, z + 1, 1, 1, color.r, color.g, color.b, 1/255 ],
      [ x, y + 1, z + 1, 0, 0, color.r, color.g, color.b, 1/255 ]
    );

    // Bottom
    pushQuad(
      vertices,
      [ x, y + 1, z, 0, 0, color.r, color.g, color.b, 2/255 ],
      [ x + 1, y + 1, z, 1, 0, color.r, color.g, color.b, 2/255 ],
      [ x + 1, y, z, 1, 1, color.r, color.g, color.b, 2/255 ],
      [ x, y, z, 0, 0, color.r, color.g, color.b, 2/255 ]
    );

    // Front
    pushQuad(
      vertices,
      [ x, y, z, 0, 0, color.r, color.g, color.b, 3/255 ],
      [ x + 1, y, z, 1, 0, color.r, color.g, color.b, 3/255 ],
      [ x + 1, y, z + 1, 1, 1, color.r, color.g, color.b, 3/255 ],
      [ x, y, z + 1, 0, 0, color.r, color.g, color.b, 3/255 ]
    );

    // Back
    pushQuad(
      vertices,
      [ x, y + 1, z + 1, 0, 0, color.r, color.g, color.b, 4/255 ],
      [ x + 1, y + 1, z + 1, 1, 0, color.r, color.g, color.b, 4/255 ],
      [ x + 1, y + 1, z, 1, 1, color.r, color.g, color.b, 4/255 ],
      [ x, y + 1, z, 0, 0, color.r, color.g, color.b, 4/255 ]
    );

    // Left
    pushQuad(
      vertices,
      [ x, y, z + 1, 0, 0, color.r, color.g, color.b, 5/255 ],
      [ x, y + 1, z + 1, 1, 0, color.r, color.g, color.b, 5/255 ],
      [ x, y + 1, z, 1, 1, color.r, color.g, color.b, 5/255 ],
      [ x, y, z, 0, 0, color.r, color.g, color.b, 5/255 ]
    );

    // Right
    pushQuad(
      vertices,
      [ x + 1, y, z, 0, 0, color.r, color.g, color.b, 6/255 ],
      [ x + 1, y + 1, z, 1, 0, color.r, color.g, color.b, 6/255 ],
      [ x + 1, y + 1, z + 1, 1, 1, color.r, color.g, color.b, 6/255 ],
      [ x + 1, y, z + 1, 0, 0, color.r, color.g, color.b, 6/255 ]
    );
  }
}

export default Block;