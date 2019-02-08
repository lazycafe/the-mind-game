import React, { Component } from 'react';
import './App.css';
import { getUserName } from './userNameFunctions';

class WaitingRoomScreen extends Component {

  isLeader() {
    return this.props.gameState && this.props.gameState.gameLeaderPlayerId === getUserName();
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
