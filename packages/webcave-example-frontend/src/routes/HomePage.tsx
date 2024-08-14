import React from "react";
import { Link } from 'react-router-dom'

const isMultiplayer = import.meta.env.VITE_APP_IS_MULTIPLAYER === "true";

const HomePage = () => {
  return (
    <div>
      <Link to="/singleplayer">
        <p>
          Play Single-player WebCave
        </p>
      </Link>

      {isMultiplayer &&
        <Link to="/multiplayer">
          <p>
            Play Multi-player WebCave
          </p>
        </Link>
      }
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  )
}

export default HomePage;