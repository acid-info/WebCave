import React from "react";
import { WebCaveMultiplayer } from '@acid-info/webcave-react/src'

const MultiplayerPage: React.FC = () => {
  return (
    <>
      <WebCaveMultiplayer
        chunkSize={8}
        serverUrl={import.meta.env.VITE_APP_SERVER_URL}
      />
    </>
  )
}

export default MultiplayerPage;