"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const gameLogic_1 = require("./gameLogic");
const _ = require('lodash');
class GameRoom extends colyseus_1.Room {
    // When room is initialized
    onInit(options) {
        this.setState(gameLogic_1.getDefaultGameState(options.gameId));
    }
    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin(options, isNew) {
        if (this.state.id === options.gameId) {
            return true;
        }
        else {
            return false;
        }
    }
    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth(options) {
        return true;
    }
    // When client successfully join the room
    onJoin(client, options, auth) {
        console.log('join!');
        this.handleAction({
            type: 'JoinGameAction',
            userId: client.sessionId,
            userName: options.userName || 'inspector no name'
        });
    }
    handleAction(action) {
        const nextState = gameLogic_1.gameStateReducer(action, this.state);
        if (action.type === 'PlayLowestNumberAction' && nextState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
            setTimeout(() => {
                this.handleAction({
                    type: 'BeginNextRoundAction'
                });
            }, 5000);
        }
        this.setState(nextState);
        this.broadcast({ gameState: nextState });
    }
    // When a client sends a message
    onMessage(client, message) {
        if (message && message.type) {
            this.handleAction(message);
        }
    }
    // When a client leaves the room
    onLeave(client, consented) {
        this.handleAction({
            type: 'LeaveGameAction',
            userId: client.sessionId
        });
        //remove them from the game state
        //TODO wait 20 seconds for reconnection
    }
    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
    }
}
exports.GameRoom = GameRoom;
