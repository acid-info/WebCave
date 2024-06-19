import React from 'react'
import { DEFAULT_WORLD_STRING } from './WebCave.defaultWorld.ts'
import { WebCaveGameState } from './WebCave.types.ts'
import { Physics, World } from '@acid-info/webcave-core/src'
import { Player, Renderer, SELECTOR_WIDTH_PX } from "@acid-info/webcave-client/src"
import styled from '@emotion/styled'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'

export default function WebCave() {
  const [gameState, setGameState] = useState<WebCaveGameState>()
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null)
  const materialSelectorRef = useRef<HTMLTableElement>(null)

  const initWorldState = () => {
    const world = new World(16, 16, 16)
    world.createFromString(DEFAULT_WORLD_STRING)

    const renderer = new Renderer(webCaveRenderSurface.current!)
    renderer.setWorld(world, 8)
    renderer.setPerspective(70, 0.01, 200)

    const physics = new Physics()
    physics.setWorld(world)

    const player = new Player()
    player.setWorld(world)
    player.setRenderer(renderer)
    player.setInputCanvas(containerRef.current!, webCaveRenderSurface.current!)
    player.setMaterialSelector(materialSelectorRef.current!)

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
    <Body ref={containerRef} onContextMenu={onContextMenu}>
      <Canvas ref={webCaveRenderSurface}/>
      <ItemsSelectorTableContainer>
        <ItemsSelectorTable ref={materialSelectorRef}>
          <tbody>
            <tr></tr>
          </tbody>
        </ItemsSelectorTable>
      </ItemsSelectorTableContainer>
    </Body>
  )
}

const Body = styled.div`
  height: 360px;
  width: 100%;
  background: url('/webcave/background.png');
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`

const ItemsSelectorTableContainer = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: ${SELECTOR_WIDTH_PX}px;
  display: flex;
  justify-content: center;
`

const ItemsSelectorTable = styled.table`
    background: rgba(0, 0, 0, 0.6);

    & tr {
        height: ${SELECTOR_WIDTH_PX}px;
    }

    & tr > td {
        width: ${SELECTOR_WIDTH_PX}px;
        margin: 0;
        padding: 0;
        cursor: pointer;
        opacity: 0.3;

        background: url('/webcave/blockthumbs.png') 0 0;
    }
`
