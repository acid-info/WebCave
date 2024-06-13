type TexturePositionTuple = [x1: number, y1: number, x2: number, y2: number];

type GetTexture = (world: any, lightmap: any, lit: boolean, x: number, y: number, z: number, dir: EDirection) => TexturePositionTuple;

enum EMaterial {
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

type MaterialProperties = {
  id: EMaterial;
  spawnable: boolean;
  transparent: boolean;
  selflit: boolean;
  gravity: boolean;
  fluid: boolean;
  texture: GetTexture
}