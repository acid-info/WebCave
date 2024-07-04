import React from 'react'
import { DEFAULT_WORLD_STRING } from './WebCave.defaultWorld.ts'
import { WebCaveGameState, WebCaveProps } from './WebCave.types.ts'
import { Physics, World } from '@acid-info/webcave-core/src/index.ts'
import { DEFAULT_SELECTOR_WIDTH_PX, Player, Renderer } from '@acid-info/webcave-client/src/index.ts'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import {
  Body,
  Canvas,
  ItemsSelectorTableContainer,
  ItemsSelectorTable
} from "../styles/WebCave.styles.ts"

const WebCave: React.FC<WebCaveProps> = (props) => {
  const {
    selectorWidthPx = DEFAULT_SELECTOR_WIDTH_PX,
    worldString = DEFAULT_WORLD_STRING,
    worldSize,
    chunkSize
  } = props;

  const [gameState, setGameState] = useState<WebCaveGameState>()
  const containerRef = useRef<HTMLDivElement>(null)
  const textCanvasRef = useRef<HTMLCanvasElement>(null)
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const materialSelectorRef = useRef<HTMLTableElement>(null)

  const initWorldState = () => {
    const world = new World(worldSize, worldSize, worldSize)
    world.createFromString(worldString)

    const renderer = new Renderer(webCaveRenderSurface.current, textCanvasRef.current)
    renderer.setWorld(world, chunkSize)
    renderer.setPerspective(70, 0.01, 200)

    const player = new Player()
    player.setWorld(world)
    player.setRenderer(renderer)
    player.setInputCanvas(containerRef.current!, webCaveRenderSurface.current!)
    player.setMaterialSelector(materialSelectorRef.current!, selectorWidthPx)

    setGameState({
      world,
      renderer,
      player,
    })
  }

  const renderWorld = () => {
    if (gameState) {
      const { player, renderer } = gameState

      if (renderer.shouldSkipRender()) {
        return;
      }

      if (renderer.lastRenderSkipped) {
        player.lastUpdate = null;
      }

      // Force chunk building due to lost context and buffer being cleaned by the browser
      player.update()
      renderer.buildChunks(chunkSize, renderer.lastRenderSkipped)
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
      <canvas ref={textCanvasRef}/>
    </Body>
  )
}

export default WebCave;