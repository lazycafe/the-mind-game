import React, { Component } from 'react';
import './App.css';
import withGameState from './withGameState';
import WaitingRoomScreen from './WaitingRoomScreen';
import {setUserName, getUserName} from './userNameFunctions';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// const exampleGameState = {
//     round: 1,
//     totalRounds: 12,
//     gameLeaderPlayerId: '',
//     gameStatus: 'IN_PROGRESS',
//     playerStates: {
//         'andrealized': {
//             id: 'andrealized',
//             cards: [15,27,22]
//         },
//         'jmoneyswagtime': {
//             id: 'jmoneyswagtime',
//             cards: [4,89,24]
//         }
//     },
//     discardedCards: [1, 5, 6],
//     lives: 2
// }

class GameScreen extends Component {

  componentDidMount() {
    this.myUserId = getUserName();
    this.gameId = this.props.match.params.id;
    this.props.joinGame(this.myUserId, this.gameId);
  }

  render() {
    let gameState = this.props.gameState;
    let myUserId = getUserName();
    console.log('gameState', gameState)

    if (!gameState || gameState.round === 0 || !gameState.playerStates[this.myUserId] || gameState.gameStatus === 'HAS_NOT_BEGUN') {
      return <WaitingRoomScreen {...this.props}/>
    } else if (gameState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
      return (<h1>Waiting for next round!</h1>);
    } else if (gameState.gameStatus === 'LOST') {
      return (<h1>you lost 😭😭😭😭</h1>)
    } else if (gameState.gameStatus === 'WON') {
      return (<h1>you won 🙌🙌🙌🙌🙌</h1>)
    }

    let myCards = gameState.playerStates[myUserId].cards;
    let outOfCards = !myCards.length;

    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <div className="gameSection">
          <h3 className="roundAndLives">Round: {gameState.round} of 12 &nbsp;&nbsp;&nbsp;Lives: {gameState.lives}</h3>

          {Object.values(gameState.playerStates).map(player =>
            <div className="playerList">
             <div className="playerListName">
              { player.id === myUserId && <span>*</span> }
              {player.id}
             </div>
              <div>{player.cards.length} cards left</div>
            </div>
          )}
        </div>

        <div className="gameSection">
          <h3>Last Card Played</h3>
          <div className="cardNumber">
            {gameState.discardedCards[gameState.discardedCards.length - 1]}
          </div>
        </div>

        <div className="gameSection">
          <h3>Your Cards</h3>
          <div className="cardNumber">
            {myCards.join(' ')}
          </div>
        </div>

        { !outOfCards &&
          <div className="gameSection">
            <p>Push the button if you think you hold the lowest card in your hand.</p>
            <button onClick={this.props.playLowestCard}>Play Lowest Card</button>
          </div>
        }
      </div>
    );
  }
}

export default withGameState(GameScreen);
