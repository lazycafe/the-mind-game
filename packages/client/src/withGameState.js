import React, { Component } from 'react';
import { getUserName } from './userNameFunctions';
const Colyseus = require('colyseus.js');
console.log(Colyseus);
//const client = new Colyseus.Client("ws://localhost:2657")
const client = new Colyseus.Client("wss://the-mind-game-server.now.sh");

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

            this.room.onMessage.add(message => {
                if (message && message.gameState) {
                    console.log('setting game state', message);
                    this.setState({gameState: message.gameState}, () => {
                        this.forceUpdate();
                    });
                }
            });
            this.room.listen('', (...args) => {
                console.log('listen!',...args);
            })
            window.room = this.room;

        }
    
        notInGame() {
            return this.state.gameState;
        }

        getUserId() {
            if (!this.room) {
                return '';
            }
            return this.room.sessionId;
        }

        getGameId() {
            return this.props.match.params.id;
        }

        refresh() {
            
        }
    
        joinGame(name, gameId) {
            this.room = client.join('game', {
                gameId,
                userName: name
            });
        }

        restartGame() {
            const action = {
                type: 'RestartGameAction',
                userId: this.getUserId()
            }

            this.room.send(action);
        }
    
        startGame() {
            const action = {
                type: 'BeginGameAction',
                userId: this.getUserId()
            }

            this.room.send(action);
        }
    
        isLeader() {
            if (!this.state || !this.room) {
                return false;
            }
            const gameState = this.state.gameState;
            return gameState && gameState.gameLeaderPlayerId === this.room.sessionId;
        }

        playLowestCard() {
            const action = {
                type: 'PlayLowestNumberAction',
                userId: this.getUserId()
            };

            this.room.send(action);
        }

        
        render() {
            return (<Wrapped
                playLowestCard={this.playLowestCard.bind(this)}
                startGame={this.startGame.bind(this)}
                joinGame={this.joinGame.bind(this)}
                refresh={this.refresh.bind(this)}
                lastAction={this.state.lastAction}
                gameState={this.state.gameState}
                restartGame={this.restartGame.bind(this)}
                sessionId={this.getUserId()}
                isLeader={this.isLeader()}
            {...this.props} />);
        }
    }
}