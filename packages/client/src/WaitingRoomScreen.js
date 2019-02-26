import React, { Component } from 'react';
import './App.css';
import { getUserName } from './userNameFunctions';

class WaitingRoomScreen extends Component {

  shouldShowStartGameButton() {
    console.log('here', this.props);
    return this.props.isLeader && Object.keys(this.props.gameState.playerStates).length > 1;
  }

  getPlayers() {
    const gameState = this.props.gameState;
    if (gameState && gameState.playerStates) {
      return Object.values(gameState.playerStates).map(p => p.name);
    }
    return [];
  }

  render() {
    
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Waiting for all players to join...</p>
        <p>Current Users</p>
        <ul>
          {
            this.getPlayers()
              .map(id => (<li>{id}</li>))
          }
        </ul>
        <br />
        {this.shouldShowStartGameButton() && <button onClick={this.props.startGame}>Start Game</button>}
      </div>
    );
  }
}

export default WaitingRoomScreen;
