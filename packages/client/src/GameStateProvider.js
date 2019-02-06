import React, { Component } from 'react';
import io from 'socket.io-client';

const socket = io('https://the-mind-server.now.sh');


//actions to emit
//join game <-- this handles leaving any games you might already be in

export default class GameStateProvider extends Component {
    constructor(...args) {
        super(...args);
    }
    componentDidMount() {
        this.onGameUpdate = ({lastAction, state}) => {
            this.setState({
                lastAction,
                gameState: state
            });
        }
        window.socket = socket;
        socket.on('GAME_UPDATE', this.onGameUpdate);
    }

    componentWillUnmount() {
        socket.off('GAME_UPDATE', this.onGameUpdate);
    }

    refresh(userId, gameId) {
        socket.emit('GAME_ACTION', {
            gameId,
            action: {
                type: 'RefreshAction',
                userId
            }
        })
    }

    joinGame(userId, gameId) {
        socket.emit('GAME_ACTION', {
            gameId,
            action: {
                type: 'JoinGameAction',
                userId
            }
        })
    }

    startGame(userId, gameId) {
        socket.emit('GAME_ACTION', {
            gameId,
            action: {
                type: 'BeginGameAction',
                userId
            }
        })
    }

    playLowestCard(userId, gameId) {
        socket.emit('GAME_ACTION', {
            gameId,
            action: {
                type: 'PlayLowestNumberAction',
                userId
            }
        });
    }

    render() {
        return (
            <div>
                {/*this.props.children({
                    playLowestCard: this.playLowestCard.bind(this),
                    startGame: this.startGame.bind(this),
                    joinGame: this.joinGame.bind(this),
                    refresh: this.refresh.bind(this),
                    lastAction: this.state.lastAction,
                    gameState: this.state.gameState
                })*/}
                {this.props.children}
            </div>
        );
    }
}

