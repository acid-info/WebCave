import React from "react";
import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage.js'
import SingleplayerPage from './SingleplayerPage.js'
import MultiplayerPage from './MultiplayerPage.js'

const NoMatch = () => {
  return (
    <div>
      <p>404 - Not found</p>
      <Link to="/">Go Home</Link>
    </div>
  )
}

const Router = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
        <Route path="singleplayer" element={<SingleplayerPage />} />
        <Route path="multiplayer" element={<MultiplayerPage />} />

        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  )
}

export default Router;