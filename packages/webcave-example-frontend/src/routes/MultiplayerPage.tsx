import React from "react";
import { WebCaveMultiplayer } from '@acid-info/webcave-react/src'
import { EXAMPLE_TEXTURE_PACK } from '../texture'

const MultiplayerPage: React.FC = () => {
  return (
    <>
      <WebCaveMultiplayer
        chunkSize={8}
        serverUrl={import.meta.env.VITE_APP_SERVER_URL}
        texturePack={EXAMPLE_TEXTURE_PACK}
      />
    </>
  )
}

export default MultiplayerPage;