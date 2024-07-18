import React, { KeyboardEventHandler, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { WebCaveMultiplayerProps } from './WebCaveMultiplayer.types'
import { Body, Canvas, ItemsSelectorTable, ItemsSelectorTableContainer } from '../styles/WebCave.styles'
import {
  ChatBox,
  ChatBoxEntry,
  ChatBoxText,
  ChatContainer, CloseChatButton,
  JoinInfo,
  Nickname,
  NicknameEntry,
} from '../styles/Inputs.styles'
import { PayloadBySocketEvent } from '@acid-info/webcave-core/src'
import { MultiplayerClient, Player, Renderer } from '@acid-info/webcave-client/src'
import { HandlerByMultiplayerEvent } from '@acid-info/webcave-client/src/types/multiplayer'
import { EChatActions } from '@acid-info/webcave-client/src/shared/controls'
import { DEFAULT_SELECTOR_WIDTH_PX } from '@acid-info/webcave-client/src'

const WebCaveMultiplayer: React.FC<WebCaveMultiplayerProps> = (props) => {
  const {
    selectorWidthPx = DEFAULT_SELECTOR_WIDTH_PX,
    chunkSize,
    serverUrl,
    texturePack,
  } = props;

  const [client, setClient] = useState<MultiplayerClient>();
  const [renderer, setRenderer] = useState<Renderer>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isKicked, setIsKicked] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string>();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<PayloadBySocketEvent<"msg">[]>([]);
  const [nickname, setNickname] = useState<string>();

  const containerRef = useRef<HTMLDivElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null)
  const webCaveRenderSurface = useRef<HTMLCanvasElement>(null);
  const materialSelectorRef = useRef<HTMLTableElement>(null);
  const chatBoxInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nicknameInputRef.current.focus();

    const rend = new Renderer(
      webCaveRenderSurface.current,
      textCanvasRef.current,
      texturePack
    )

    setRenderer(rend)
  }, []);

  useEffect(() => {
    if (client && !client.socket) {
      joinGame()
    }

    return () => {
      if (client && client.socket) {
        client.socket.disconnect();
      }
    }
  }, [client])

  useEffect(() => {
    let lastUpdate = +new Date() / 1000.0;
    let intervalId: NodeJS.Timeout | undefined = undefined

    if (isReady) {
      intervalId = setInterval(() => {
        const currentTime = +new Date / 1000;
        renderWorld(); // Update local

        if (currentTime - lastUpdate > 0.033 && !renderer.shouldSkipRender()) {
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

  const renderWorld = () => {
    if (client) {
      const player = client.world.localPlayer

      if (renderer.shouldSkipRender()) {
        return;
      }

      if (renderer.lastRenderSkipped) {
        player.lastUpdate = null;
      }

      player.update()
      renderer.buildChunks(chunkSize, renderer.lastRenderSkipped)
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

      client.sendMessage(msg);

      chatBoxInputRef.current.value = "";
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
    client.on("message", onMessageHandler)
    client.on("chat", onChatMessageHandler)
    client.on("kick", onKickHandler)
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
    setStatusMessage(undefined)

    player.on(EChatActions.OPEN_CHAT, handleOpenChat)
  }

  const onMessageHandler: HandlerByMultiplayerEvent<"message"> = (msg) => {
    addMessageToChat({
      type: 'generic',
      msg
    })
  }
  
  const onChatMessageHandler: HandlerByMultiplayerEvent<"chat"> = (user, msg) => {
    addMessageToChat({
      type: 'chat',
      user,
      msg
    })
    return false;
  }

  const onKickHandler: HandlerByMultiplayerEvent<"kick"> = (msg) => {
    setIsKicked(true)
    setStatusMessage(msg)
  }

  const handleOpenChat = (state?: boolean) => {
    setIsChatOpen(prevState => {
      const newState = state != undefined ? state : !prevState;

      if (prevState === false) {
        chatBoxInputRef.current.focus()
      }

      return newState;
    })
  }

  return (
    <Body
      ref={containerRef}
      onContextMenu={onContextMenu}
      backgroundImage={texturePack.backgroundImage}
      width={props.width}
      height={props.height}
    >
      <canvas ref={textCanvasRef} />
      <Canvas ref={webCaveRenderSurface} isKicked={isKicked}/>
      <ItemsSelectorTableContainer
        selectorWidthPx={selectorWidthPx}
        isKicked={isKicked}
      >
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

      <ChatContainer
        isChatOpen={isChatOpen}
        isGameReady={isReady && !isKicked}
      >
        <CloseChatButton
          onClick={() => handleOpenChat(false)}
        >
          Close chat
        </CloseChatButton>
        <ChatBox onClick={() => handleOpenChat(true)}>
          <ChatBoxText>
            {messages.map((m, index) => (
              <span key={`${m}-${index}`}>
          {m.user &&
            <>
              {'<'}
              <span style={{ color: '#0a0' }}>
                {m.user}
              </span>
              {'> '}
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
          isChatOpen={isChatOpen}
          placeholder={'Enter message or toggle the chat by pressing \'t\''}
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

    </Body>
  );
}

export default WebCaveMultiplayer