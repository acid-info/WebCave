import React from 'react'
import { WebCaveGameState, WebCaveProps } from './WebCave.types'
import { World } from '@acid-info/webcave-core/src/index'
import { DEFAULT_SELECTOR_WIDTH_PX, Player, Renderer } from '@acid-info/webcave-client/src/index'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import {
  Body,
  Canvas,
  ItemsSelectorTableContainer,
  ItemsSelectorTable
} from "../../styles/WebCave.styles"
import { getPerspectiveValues } from '../../utils/acid'
import TakeAcidButton from '../TakeAcidButton/TakeAcidButton'

const WebCave: React.FC<WebCaveProps> = (props) => {
  const {
    selectorWidthPx = DEFAULT_SELECTOR_WIDTH_PX,
    worldSeed,
    worldSize,
    chunkSize,
    texturePack
  } = props;

  const [gameState, setGameState] = useState<WebCaveGameState>()
  const [acid, setAcid] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textCanvasRef = useRef<HTMLCanvasElement>(null)
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const materialSelectorRef = useRef<HTMLTableElement>(null)

  const initWorldState = () => {
    const world = new World(worldSize, worldSize, worldSize)
    world.createRandomisedWorld(worldSize / 2, worldSeed)

    const renderer = new Renderer(
      webCaveRenderSurface.current,
      textCanvasRef.current,
      texturePack
    )

    renderer.setWorld(world, chunkSize)
    renderer.setPerspective(...getPerspectiveValues(acid))

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
      backgroundImage={texturePack.backgroundImage}
      height={props.height}
      width={props.width}
    >
      <Canvas ref={webCaveRenderSurface}/>
      <ItemsSelectorTableContainer selectorWidthPx={selectorWidthPx}>
        <ItemsSelectorTable
          ref={materialSelectorRef}
          selectorWidthPx={selectorWidthPx}
          blockThumbsImage={texturePack.blockThumbsImage}
        >
          <tbody>
            <tr></tr>
          </tbody>
        </ItemsSelectorTable>
      </ItemsSelectorTableContainer>
      <canvas ref={textCanvasRef}/>
      <TakeAcidButton renderer={gameState?.renderer} />
    </Body>
  )
}

export default WebCave;