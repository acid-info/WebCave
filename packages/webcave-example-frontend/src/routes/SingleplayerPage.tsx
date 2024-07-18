import React from "react";
import { WebCave } from '@acid-info/webcave-react/src/index.js'
import { EXAMPLE_TEXTURE_PACK } from '../texture'

const SingleplayerPage: React.FC = () => {
  return (
    <>
      <WebCave
        chunkSize={8}
        worldSize={16}
        texturePack={EXAMPLE_TEXTURE_PACK}
      />
    </>
  )
}

export default SingleplayerPage;