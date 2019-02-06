import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class WaitingRoomScreen extends Component {

  startGame() {

  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Connect to the collective mind</p>
        <button onClick={this.startGame.bind(this)}>Start Game</button>
      </div>
    );
  }
}

export default WaitingRoomScreen;
