import React, { Component } from 'react';
import './App.css';
import {setUserName, getUserName} from './userNameFunctions';
import { withRouter } from 'react-router-dom'
import LoginForm from './LoginForm';
class JoinGameScreen extends Component {

  joinGame(gameId, userName) {
    if (userName && userName.trim() && gameId && gameId.trim && gameId.trim()) {
      this.props.history.push(
        '/game/'+encodeURI(gameId.trim())
      );
    }
  }


  render() {
    return (
      <LoginForm
        onSubmit={this.joinGame.bind(this)}
      />
    );
  }
}

export default withRouter(JoinGameScreen);
