import React from 'react'
import { DEFAULT_WORLD_STRING } from './WebCave.defaultWorld.ts'
import { WebCaveGameState, WebCaveProps } from './WebCave.types.ts'
import { Physics, World } from '@acid-info/webcave-core/src'
import { DEFAULT_SELECTOR_WIDTH_PX, Player, Renderer } from '@acid-info/webcave-client/src'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import {
  Body,
  Canvas,
  ItemsSelectorTableContainer,
  ItemsSelectorTable
} from "./WebCave.styles.ts"

const WebCave: React.FC<WebCaveProps> = (props) => {
  const {
    selectorWidthPx = DEFAULT_SELECTOR_WIDTH_PX,
    worldString = DEFAULT_WORLD_STRING,
    worldSize,
    chunkSize
  } = props;

  const [gameState, setGameState] = useState<WebCaveGameState>()
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null)
  const materialSelectorRef = useRef<HTMLTableElement>(null)

  const initWorldState = () => {
    const world = new World(worldSize, worldSize, worldSize)
    world.createFromString(worldString)

    const renderer = new Renderer(webCaveRenderSurface.current!)
    renderer.setWorld(world, chunkSize)
    renderer.setPerspective(70, 0.01, 200)

    const physics = new Physics()
    physics.setWorld(world)

    const player = new Player()
    player.setWorld(world)
    player.setRenderer(renderer)
    player.setInputCanvas(containerRef.current!, webCaveRenderSurface.current!)
    player.setMaterialSelector(materialSelectorRef.current!, selectorWidthPx)

    setGameState({
      world,
      renderer,
      physics,
      player,
    })
  }

  const takeDrugs = () => {
    gameState?.renderer.setPerspective(40, 0.01, 200)
    gameState?.renderer.draw()
  }

  const renderWorld = () => {
    if (gameState) {
      const { physics, player, renderer } = gameState

      physics.simulate()
      player.update()
      renderer.buildChunks(1)
      renderer.setCamera(player.getEyePos().toArray(), player.angles)
      renderer.draw()
    }
  }

  useEffect(() => {
    if (webCaveRenderSurface && containerRef && materialSelectorRef) {
      initWorldState()
    }
  }, [webCaveRenderSurface, containerRef, materialSelectorRef])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined
    if (gameState) {
      intervalId = setInterval(renderWorld, 16)
    } else {
      clearInterval(intervalId)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [gameState])

  const onContextMenu: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    return false
  }

  return (
    <Body
      ref={containerRef}
      onContextMenu={onContextMenu}
    >
      <Canvas ref={webCaveRenderSurface}/>
      <ItemsSelectorTableContainer selectorWidthPx={selectorWidthPx}>
        <ItemsSelectorTable
          ref={materialSelectorRef}
          selectorWidthPx={selectorWidthPx}
        >
          <tbody>
            <tr></tr>
          </tbody>
        </ItemsSelectorTable>
      </ItemsSelectorTableContainer>
    </Body>
  )
}

export default WebCave;