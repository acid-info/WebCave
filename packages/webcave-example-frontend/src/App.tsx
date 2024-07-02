import React from 'react'
import './App.css'
import Router from './routes/index.js'
import { HashRouter } from 'react-router-dom'


function App() {
  return (
    <>
      <HashRouter>
        <Router/>
      </HashRouter>
    </>
  )
}

export default App
