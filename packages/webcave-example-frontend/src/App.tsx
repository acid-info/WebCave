import React from 'react'
import './App.css'
import { WebCave } from '@acid-info/webcave-react/src'


function App() {
  return (
    <>
      <WebCave
        chunkSize={8}
        worldSize={16}
      />
    </>
  )
}

export default App
