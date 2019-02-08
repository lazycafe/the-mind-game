import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class WaitingRoomScreen extends Component {

  isLeader() {
    return false;
  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Waiting for all players to join...</p>
        <br />
        {this.isLeader() && <button onClick={this.props.startGame}>Start Game</button>}
      </div>
    );
  }
}

export default WaitingRoomScreen;
