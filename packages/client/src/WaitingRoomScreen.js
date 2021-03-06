import React, { Component } from 'react';
import './App.css';
import { getUserName } from './userNameFunctions';

import { CopyToClipboard } from 'react-copy-to-clipboard';

class WaitingRoomScreen extends Component {

  shouldShowStartGameButton() {
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
        {
          this.getPlayers()
            .map(name => (<p>{name}</p>))
        }
        <br />
        {this.shouldShowStartGameButton() && <button onClick={this.props.startGame}>Start Game</button>}

        <br />
        <br />
        <br />
        <br />

        <CopyToClipboard
          text={window.location.href}
          onCopy={() => {
            alert('Copied to clipboard!');
          }}
        >
          <button>Copy invite link to clipboard</button>
        </CopyToClipboard>
      </div>
    );
  }
}

export default WaitingRoomScreen;
