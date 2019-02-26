import React, { Component } from 'react';
import './App.css';
import withGameState from './withGameState';
import {withUserNameGate} from './UserNameGate';
import WaitingRoomScreen from './WaitingRoomScreen';
import {setUserName, getUserName} from './userNameFunctions';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class GameScreen extends Component {

  componentDidMount() {
    this.myUserName = getUserName();
    this.gameId = this.props.match.params.id;
    this.props.joinGame(this.myUserName, this.gameId);
  }


  render() {
    let gameState = this.props.gameState;
    console.log('getting ready for next round', gameState)

    if (!gameState || gameState.round === 0 || !gameState.playerStates[this.props.sessionId] || gameState.gameStatus === 'HAS_NOT_BEGUN') {
      return <WaitingRoomScreen {...this.props}/>
    } else if (gameState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
      return (
        <div className="gameBody">
          <h1>Round passed!</h1>
          <p>Please wait for the next round to begin.</p>
        </div>
      )
    } else if (gameState.gameStatus === 'LOST') {
      return (
        <div className="gameBody">
          <h1>You lost.</h1>
          <p>Better luck next time!</p>
          {this.props.isLeader && <button onClick={this.props.restartGame}>Restart Game</button>}
          {!this.props.isLeader && <p>Waiting for the game leader to restart the game</p>}
          <Link to="/"><button>Join New Game</button></Link>
        </div>
      )
    } else if (gameState.gameStatus === 'WON') {
      return (
        <div className="gameBody">
          <h1>YOU WON!</h1>
          <p>Congratulations, your minds were in sync. Now do it again!</p>
          {this.props.isLeader && <button onClick={this.props.restartGame}>Restart Game</button>}
          {!this.props.isLeader && <p>Waiting for the game leader to restart the game</p>}
          <Link to="/"><button>Join New Game</button></Link>
        </div>
      )
    }

    let myCards = gameState.playerStates[this.props.sessionId].cards;
    let outOfCards = !myCards.length;
    const lastCardAction = gameState.discardActions.length > 0
      && gameState.discardActions[gameState.discardActions.length - 1];

    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <div className="gameSection">
          <h3 className="roundAndLives">Round: {gameState.round} of 12 &nbsp;&nbsp;&nbsp;Lives: {gameState.lives}</h3>

          {Object.values(gameState.playerStates).map(player =>
            <div className="playerList" key={player.id}>
             <div className="playerListName">
              { player.id === this.props.sessionId && <span>*</span> }
              {player.name}
             </div>
              <div>{player.cards.length} cards left</div>
            </div>
          )}
        </div>

        <div className="gameSection">
          <h3>Last Card Played:</h3>
          {lastCardAction && 
           <p>
            <span className={"cardNumber" + (lastCardAction.wasLowestCard ? "" : ' wrongColor')}>
                      {lastCardAction.card}
            </span>
            <span> was played by {lastCardAction.userName}</span>
            </p>
          }
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

export default withUserNameGate(
  withGameState(
    GameScreen
  )
);
