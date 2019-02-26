import { Room, Client } from "colyseus";
import produce from "immer"
import { gameStateReducer, getDefaultGameState, GameAction, GameState } from "./gameLogic";
const _ = require('lodash');


export class GameRoom extends Room<GameState> {
    // When room is initialized
    onInit (options: any) {
        this.setState(getDefaultGameState(
            options.gameId
        ));
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin (options: any, isNew: boolean) { 
        if (this.state.id === options.gameId) {
            return true;
        } else {
            return false;
        }
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (options: any) {
        return true;
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        console.log('join!');
        this.handleAction({
            type: 'JoinGameAction',
            userId: client.sessionId,
            userName: options.userName || 'inspector no name'
        });
    }

    handleAction(action: GameAction) {
        const nextState = gameStateReducer(action, this.state);
        if (action.type === 'PlayLowestNumberAction' && nextState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
            setTimeout(() => {
                this.handleAction({
                    type: 'BeginNextRoundAction'
                });
            }, 5000);
        }
        this.setState(nextState);
        this.broadcast({gameState: nextState});
    }

    // When a client sends a message
    onMessage (client: Client, message: GameAction) {
        if (message && message.type) {
            this.handleAction(message);
        }
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        this.handleAction({
            type: 'LeaveGameAction',
            userId: client.sessionId
        });
        //remove them from the game state
        //TODO wait 20 seconds for reconnection
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {

    }
}