import React from "react";
import { WebCave } from '@acid-info/webcave-react/src'
import { EXAMPLE_TEXTURE_PACK } from '../texture'

const SingleplayerPage: React.FC = () => {
  return (
    <>
      <WebCave
        chunkSize={8}
        worldSize={64}
        worldSeed="acid-info"
        texturePack={EXAMPLE_TEXTURE_PACK}
        height={"700px"}
      />
    </>
  )
}

export default SingleplayerPage;