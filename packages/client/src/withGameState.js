import React, { Component } from 'react';
import io from 'socket.io-client';
import { getUserName } from './userNameFunctions';

const socket = io('https://the-mind-server.now.sh');


//actions to emit
//join game <-- this handles leaving any games you might already be in


export default function withGameState(Wrapped) {
    return class extends Component {

        constructor(...args) {
            super(...args);
            this.state = {};
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
    
        notInGame() {
            return this.state.gameState;
        }

        getUserId() {
            return getUserName();
        }

        getGameId() {
            return this.props.match.params.id;
        }

        refresh() {
            if (this.gameId && this.userId) {}
            socket.emit('GAME_ACTION', {
                gameId: this.getGameId(),
                action: {
                    type: 'RefreshAction',
                    userId: this.getUserId()
                }
            })
        }
    
        joinGame(userId, gameId) {
            socket.emit('GAME_ACTION', {
                gameId: this.getGameId(),
                action: {
                    type: 'JoinGameAction',
                    userId: this.getUserId()
                }
            })
        }
    
        startGame() {
            socket.emit('GAME_ACTION', {
                gameId: this.getGameId(),
                action: {
                    type: 'BeginGameAction',
                    userId: this.getUserId()
                }
            })
        }
    
        playLowestCard() {
            socket.emit('GAME_ACTION', {
                gameId: this.getGameId(),
                action: {
                    type: 'PlayLowestNumberAction',
                    userId: this.getUserId()
                }
            });
        }

        render() {
            return (<Wrapped
                playLowestCard={this.playLowestCard.bind(this)}
                startGame={this.startGame.bind(this)}
                joinGame={this.joinGame.bind(this)}
                refresh={this.refresh.bind(this)}
                lastAction={this.state.lastAction}
                gameState={this.state.gameState}
            {...this.props} />);
        }
    }
}