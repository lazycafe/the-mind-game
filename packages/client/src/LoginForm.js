import React, { Component } from 'react';
import './App.css';
import { setUserName, getUserName } from './userNameFunctions';
class LoginForm extends Component {

    static get defaultProps() {
        return {
            onSubmit: (gameId, userName) => { },
            showGameIdField: true,
            buttonText: 'Join Game'
        }
    }

    joinGame() {
        this.props.onSubmit(this.state.gameId, this.state.userName)
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
                {this.props.showGameIdField && <p>
                    <input
                        value={this.state.gameId}
                        onChange={(event) => {
                            this.setState({ gameId: event.target.value })
                        }}
                        id="gameId"
                        placeholder="Game ID"
                    />
                </p>}
                <p>
                    <input
                        value={this.state.userName}
                        onChange={(event) => {
                            this.setState({ userName: event.target.value });
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

export default LoginForm;
