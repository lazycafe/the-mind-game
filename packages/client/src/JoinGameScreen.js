import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {setUserName, getUserName} from './userNameFunctions';
import { withRouter } from 'react-router-dom'
class JoinGameScreen extends Component {

  joinGame() {
    console.log(this.props);
    const gameId = this.state.gameId;
    //navigate to other screen
    if (gameId && gameId.trim && gameId.trim()) {
      this.props.history.push(
        '/game/'+encodeURI(gameId.trim())
      );
    }
  }

  state = {
    gameId: '',
    userName: getUserName(false)
  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Connect to the collective mind. Learn to cooperate to become one.</p>
        <br />
        <p>
          <input
            value={this.state.gameId}
            onChange={(event) => {
              this.setState({gameId: event.target.value})
            }}
            id="gameId"
            placeholder="Game ID"
            />
        </p>
        <p>
          <input
            value={this.state.userName}
            onChange={(event) => {
              this.setState({userName: event.target.value});
              setUserName(event.target.value);
            }}
            id="alias"
            placeholder="Your Alias" />
        </p>
        <button onClick={this.joinGame.bind(this)}>Join Game</button>
      </div>
    );
  }
}

export default withRouter(JoinGameScreen);
