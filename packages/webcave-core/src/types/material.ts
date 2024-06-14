import World from '../world'

/**
 * relative Coordinates of the texture inside the textures matrix image
 *
 * For example: If image containing all textures is a 16x16 Matrix.
 * We can find the exact texture of a specific block by pointing where
 * it's topLeft and bottomRight coordinates are by:
 * - dividing 1 with position on the axis where max is 16 (size of the grid)
 *
 * Example:
 * Top Left elements (assuming it's a square) coordinates are:
 *  - topLeft: [0/16, 0/16]
 *  - bottomRight: [1/16, 1/16]
 * Which would yield: [0, 0, 0.0625, 0.0625]
 * (The coordinates are rational numbers mapped from 0 to 1)
 */
type TexturePositionTuple = [x1: number, y1: number, x2: number, y2: number];

// @TODO typings for lightmap
type GetTexture = (params: {
  world: World,
  lightmap: any,
  lit: boolean,
  x: number,
  y: number,
  z: number,
  dir: EDirection
}) => TexturePositionTuple;

export enum EMaterial {
  AIR = 0,
  BEDROCK = 1,
  DIRT = 2,
  WOOD = 3,
  TNT = 4,
  BOOKCASE = 5,
  LAVA= 6,
  PLANK= 7,
  COBBLESTONE= 8,
  CONCRETE= 9,
  BRICK= 10,
  SAND= 11,
  GRAVEL= 12,
  IRON= 13,
  GOLD= 14,
  DIAMOND= 15,
  OBSIDIAN= 16,
  GLASS= 17,
  SPONGE = 18
}

export type Material = {
  id: EMaterial;
  spawnable: boolean;
  transparent: boolean;
  selflit?: boolean;
  gravity?: boolean;
  fluid?: boolean;
  texture?: GetTexture
}