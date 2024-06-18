import React, { useState } from 'react'
import './App.css'
import { WebCave } from './WebCave/index.js'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WebCave/>
    </>
  )
}

export default App
