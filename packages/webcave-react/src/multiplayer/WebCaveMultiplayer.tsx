import React, { MouseEventHandler, useRef, useState } from 'react'
import { WebCaveMultiplayerProps, WebCaveMultiplayerState } from './WebCaveMultiplayer.types.ts'
import { Body, Canvas, ItemsSelectorTable, ItemsSelectorTableContainer } from '../styles/WebCave.styles.ts'
import { Socket } from 'socket.io-client'

const WebCaveMultiplayer: React.FC<WebCaveMultiplayerProps> = (props) => {
  const {
    selectorWidthPx,
    chunkSize,
    serverUrl
  } = props;

  const [client, setClient] = useState<Socket>();

  const containerRef = useRef<HTMLDivElement>(null)
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const materialSelectorRef = useRef<HTMLTableElement>(null)

  const joinGame = () => {

  }

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

      kad dodju
    </Body>
  );
}

export default WebCaveMultiplayer;