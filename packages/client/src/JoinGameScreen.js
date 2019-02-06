import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class JoinGameScreen extends Component {

  joinGame() {

  }

  render() {
    return (
      <div className="gameBody">
        <h1>The Mind</h1>
        <p>Connect to the collective mind. Learn to cooperate to become one.</p>
        <br />
        <br />
        <p><input id="gameId" placeholder="Game ID" /></p>
        <p><input id="alias" placeholder="Your Alias" /></p>
        <button onClick={this.joinGame.bind(this)}>Join Game</button>
      </div>
    );
  }
}

export default JoinGameScreen;
