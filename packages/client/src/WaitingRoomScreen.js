import React, { Component } from 'react';
import './App.css';
import { getUserName } from './userNameFunctions';

class WaitingRoomScreen extends Component {

  isLeader() {
    return this.props.gameState && this.props.gameState.gameLeaderPlayerId === getUserName();
  }

  shouldShowStartGameButton() {
    return this.isLeader() && Object.keys(this.props.gameState.playerStates).length > 1;
  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Waiting for all players to join...</p>
        <br />
        {this.shouldShowStartGameButton() && <button onClick={this.props.startGame}>Start Game</button>}
      </div>
    );
  }
}

export default WaitingRoomScreen;
