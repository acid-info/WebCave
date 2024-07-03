import React, { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { WebCaveMultiplayerProps } from './WebCaveMultiplayer.types.ts'
import { Body, Canvas, ItemsSelectorTable, ItemsSelectorTableContainer } from '../styles/WebCave.styles.ts'
import {
  ChatBox,
  ChatBoxEntry,
  ChatBoxText,
  ChatContainer,
  JoinInfo,
  Nickname,
  NicknameEntry,
} from '../styles/Inputs.styles.ts'
import { PayloadBySocketEvent } from '@acid-info/webcave-core/src'
import { MultiplayerClient, Player, Renderer } from '@acid-info/webcave-client/src'
import { HandlerByMultiplayerEvent } from '@acid-info/webcave-client/src/types/multiplayer.ts'
import { EChatActions } from '@acid-info/webcave-client/src/shared/controls.ts'

const WebCaveMultiplayer: React.FC<WebCaveMultiplayerProps> = (props) => {
  const {
    selectorWidthPx,
    chunkSize,
    serverUrl
  } = props;

  const [client, setClient] = useState<MultiplayerClient>();
  const [renderer, setRenderer] = useState<Renderer>();
  const [isReady, setIsReady] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string>();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<PayloadBySocketEvent<"msg">[]>([]);
  const [nickname, setNickname] = useState<string>();

  const containerRef = useRef<HTMLDivElement>(null);
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const materialSelectorRef = useRef<HTMLTableElement>(null);
  const chatBoxInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nicknameInputRef.current.focus();
    setRenderer(new Renderer(webCaveRenderSurface.current))

    return () => {
      client.socket.disconnect();
    }
  }, []);

  useEffect(() => {
    if (client && !client.socket) {
      joinGame()
    }
  }, [client])

  useEffect(() => {
    let lastUpdate = +new Date() / 1000.0;
    let intervalId: NodeJS.Timeout | undefined = undefined

    if (isReady) {
      intervalId = setInterval(() => {
        const currentTime = +new Date / 1000;
        renderWorld(lastUpdate); // Update local

        if (currentTime - lastUpdate > 0.033) {
          client.updatePlayer()
          lastUpdate = currentTime;
        }
      }, 16)
    } else {
      clearInterval(intervalId)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [isReady])

  const renderWorld = (lastUpdate: number) => {
    if (client) {
      const player = client.world.localPlayer
      player.update()
      renderer.buildChunks(chunkSize)
      renderer.setCamera(player.getEyePos().toArray(), player.angles)
      renderer.draw()
    }
  }

  const onContextMenu: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    return false
  }

  const onChatboxEntry: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      const msg = chatBoxInputRef.current.value;

      if (msg.length < 1) {
        return;
      }

      addMessageToChat({
        type: 'chat',
        user: "pajicf",
        msg
      })
    }
  }

  const onNicknameEntry: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      const _nickname = nicknameInputRef.current.value;

      if (_nickname.length < 1) {
        return;
      }

      setNickname(_nickname)
      setStatusMessage("Connecting to server...")
      setClient(new MultiplayerClient())
    }
  }

  const addMessageToChat = (message: PayloadBySocketEvent<"msg">) => {
    setMessages(prevState => {
      return [
        ...prevState,
        message
      ]
    })
  }

  const joinGame = ()=> {
    client.on("connect", onConnectionHandler)
    client.on("world", onWorldHandler)
    client.on("spawn", onSpawnHandler)
    client.connect(serverUrl, nickname)
  }

  const onConnectionHandler = () => {
    setStatusMessage("Receiving world...")
  }

  const onWorldHandler: HandlerByMultiplayerEvent<"world"> = (w) => {
    setStatusMessage("Building chunks...")

    renderer.setWorld(w, chunkSize)
    renderer.setPerspective(70, 0.01, 200)
    renderer.buildChunks(999)
    setRenderer(renderer)

    setStatusMessage("Spawning...")
  }

  const onSpawnHandler: HandlerByMultiplayerEvent<"spawn"> = () => {
    const player = new Player()
    player.setWorld(client.world)
    player.setRenderer(renderer)
    player.setClient(client)
    player.setInputCanvas(containerRef.current, webCaveRenderSurface.current)
    player.setMaterialSelector(materialSelectorRef.current, selectorWidthPx)
    setIsReady(true)

    player.on(EChatActions.OPEN_CHAT, () => {
      setIsChatOpen(true)
      chatBoxInputRef.current.focus()
    })
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

      <ChatContainer isChatOpen={isChatOpen}>
        <ChatBox>
          <ChatBoxText>
            {messages.map((m, index) => (
              <span key={`${m}-${index}`}>
              { m.user &&
                <>
                  {"<"}
                  <span style={{ color: '#0a0' }}>
                    {m.user}
                  </span>
                  {"> "}
                </>
              }
                {m.msg}
            </span>
            ))}
          </ChatBoxText>
        </ChatBox>
        <ChatBoxEntry
          ref={chatBoxInputRef}
          type="text"
          maxLength={60}
          spellCheck={false}
          onKeyDown={onChatboxEntry}
        />
      </ChatContainer>

      {!nickname &&
        <Nickname>
          <span>Nickname:</span>
          <br />
          <NicknameEntry
            ref={nicknameInputRef}
            type="text"
            maxLength={10}
            spellCheck={false}
            onKeyDown={onNicknameEntry}
          />
        </Nickname>
      }

      {statusMessage &&
        <JoinInfo>
          <span>{statusMessage}</span>
        </JoinInfo>
      }

      <button onClick={() => setIsChatOpen(prev => !prev)}>
        toggle chat
      </button>
    </Body>
  );
}

export default WebCaveMultiplayer;