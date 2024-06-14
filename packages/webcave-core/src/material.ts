import { AllKeysRequired, DynamicObject } from './types/util'
import { EMaterial, Material } from './types/material'

export const MATERIALS: DynamicObject<Material, EMaterial, AllKeysRequired> = {
  [EMaterial.AIR]: {
    id: EMaterial.AIR,
    spawnable: false,
    transparent: true
  },
  [EMaterial.BEDROCK]: {
    id: EMaterial.BEDROCK,
    spawnable: false,
    transparent: false,
    texture: () => {
      return [ 1/16, 1/16, 2/16, 2/16 ];
    }
  },
  [EMaterial.DIRT]: {
    id: EMaterial.DIRT,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: ({ dir, lit }) => {
      if ( dir == EDirection.UP && lit )
        return [ 14/16, 0/16, 15/16, 1/16 ];
      else if ( dir == EDirection.DOWN || !lit )
        return [ 2/16, 0/16, 3/16, 1/16 ];
      else
        return [ 3/16, 0/16, 4/16, 1/16 ];
    }
  },
  [EMaterial.WOOD]: {
    id: EMaterial.WOOD,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: ({ dir }) => {
      if ( dir == EDirection.UP || dir == EDirection.DOWN )
        return [ 5/16, 1/16, 6/16, 2/16 ];
      else
        return [ 4/16, 1/16, 5/16, 2/16 ];
    }
  },
  [EMaterial.TNT]: {
    id: EMaterial.TNT,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: ({ dir }) => {
      if ( dir == EDirection.UP || dir == EDirection.DOWN )
        return [ 10/16, 0/16, 11/16, 1/16 ];
      else
        return [ 8/16, 0/16, 9/16, 1/16 ];
    }
  },
  [EMaterial.BOOKCASE]: {
    id: EMaterial.BOOKCASE,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: ({ dir }) => {
      if ( dir == EDirection.FORWARD || dir == EDirection.BACK )
        return [ 3/16, 2/16, 4/16, 3/16 ];
      else
        return [ 4/16, 0/16, 5/16, 1/16 ];
    }
  },
  [EMaterial.LAVA]: {
    id: EMaterial.LAVA,
    spawnable: false,
    transparent: true,
    selflit: true,
    gravity: true,
    fluid: true,
    texture: () => {
      return [ 13/16, 14/16, 14/16, 15/16 ];
    }
  },
  [EMaterial.PLANK]: {
    id: EMaterial.PLANK,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 4/16, 0/16, 5/16, 1/16 ];
    }
  },
  [EMaterial.COBBLESTONE]: {
    id: EMaterial.COBBLESTONE,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 0/16, 1/16, 1/16, 2/16 ];
    }
  },
  [EMaterial.CONCRETE]: {
    id: EMaterial.CONCRETE,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 1/16, 0/16, 2/16, 1/16 ];
    }
  },
  [EMaterial.BRICK]: {
    id: EMaterial.BRICK,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 7/16, 0/16, 8/16, 1/16 ];
    }
  },
  [EMaterial.SAND]: {
    id: EMaterial.SAND,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: true,
    fluid: false,
    texture: () => {
      return [ 2/16, 1/16, 3/16, 2/16 ];
    }
  },
  [EMaterial.GRAVEL]: {
    id: EMaterial.GRAVEL,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: true,
    fluid: false,
    texture: () => {
      return [ 3/16, 1/16, 4/16, 2/16 ];
    }
  },
  [EMaterial.IRON]: {
    id: EMaterial.IRON,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 6/16, 1/16, 7/16, 2/16 ];
    }
  },
  [EMaterial.GOLD]: {
    id: EMaterial.GOLD,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 7/16, 1/16, 8/16, 2/16 ];
    }
  },
  [EMaterial.DIAMOND]: {
    id: EMaterial.DIAMOND,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 8/16, 1/16, 9/16, 2/16 ];
    }
  },
  [EMaterial.OBSIDIAN]: {
    id: EMaterial.OBSIDIAN,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 5/16, 2/16, 6/16, 3/16 ];
    }
  },
  [EMaterial.GLASS]: {
    id: EMaterial.GLASS,
    spawnable: true,
    transparent: true,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 1/16, 3/16, 2/16, 4/16 ];
    }
  },
  [EMaterial.SPONGE]: {
    id: EMaterial.SPONGE,
    spawnable: true,
    transparent: false,
    selflit: false,
    gravity: false,
    fluid: false,
    texture: () => {
      return [ 0/16, 3/16, 1/16, 4/16 ];
    }
  }
}