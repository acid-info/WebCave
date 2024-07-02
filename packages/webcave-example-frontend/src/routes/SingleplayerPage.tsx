import React from "react";
import { WebCave } from '@acid-info/webcave-react/src/index.js'

const SingleplayerPage: React.FC = () => {
  return (
    <>
      <WebCave
        chunkSize={8}
        worldSize={16}
      />
    </>
  )
}

export default SingleplayerPage;