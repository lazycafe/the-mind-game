import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class WaitingRoomScreen extends Component {

  beginGame() {

  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Waiting for all players to join...</p>
        <br />
        <button onClick={this.beginGame.bind(this)}>Start Game</button>
      </div>
    );
  }
}

export default WaitingRoomScreen;
