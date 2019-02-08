const express = require("express");
import * as socketio from "socket.io";
import * as path from "path"
const _ = require('lodash');
var cors = require('cors');

import { GameState, getDefaultGameState, gameStateReducer } from "./gameLogic";

const gameStates: {[gameId: string]: GameState} = {};

const app = express();
app.use(cors())

let http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
let io = require('socket.io')(http);
//io.set('origins', '*:*');

app.get('/', (req: any, res: any) => {
  res.json(gameStates);
});



type RoomAction = {
    action: any
    gameId: string
}

function updateGameState(gameId: string, gameState: GameState, lastAction: any) {
    io.in(gameId).emit('GAME_UPDATE', {
        lastAction,
        state: gameState
    });
    gameStates[gameId] = gameState;
}

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function(socket: any){

    socket.on('ECHO', (payload: any) => {
        socket.emit('ECHO', payload);
    });

  socket.on('GAME_ACTION', (payload: RoomAction) => {

    if (!gameStates[payload.gameId]) {
        gameStates[payload.gameId] = getDefaultGameState();
    }

    if (_.get(payload, 'action.type') === 'JoinGameAction') {
        //io.sockets.manager.roomClients[socket.id].map((roomId: string) => socket.leave(roomId));
        socket.join(payload.gameId);
    }
    let oldGameState = gameStates[payload.gameId];
    let nextGameState = gameStateReducer(payload.action, oldGameState);

    updateGameState(payload.gameId, nextGameState, payload.action);

    if (_.get(payload, 'action.type') === 'PlayLowestNumberAction' && nextGameState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
        setTimeout(() => {
            let nextRoundGameState = gameStateReducer({
                type: 'BeginNextRoundAction'
            }, nextGameState);

            updateGameState(payload.gameId, nextRoundGameState, payload.action);
        }, 5000);    
    }
  });
});

const server = http.listen(1234, function(){
  console.log('listening on *:1234');
});





const exampleGameState = {
    round: 1,
    gameLeaderPlayerId: '',
    gameStatus: 'IN_PROGRESS',
    playerStates: {
        'andrealized': {
            id: 'andrealized',
            cards: [15,27,22]
        },
        'jmoneyswagtime': {
            id: 'jmoneyswagtime',
            cards: [4,89,24]
        }
    },
    discardedCards: [],
    lives: 0
}

//usage

/*

type PlayLowestNumberAction = {
    type: 'PlayLowestNumberAction'
    userId: string
}

type BeginGameAction = {
    type: 'BeginGameAction'
    userId: string
}

type JoinGameAction = {
    type: 'JoinGameAction'
    userId: string
}



socket.emit('GAME_ACTION', {
    gameId: 'my game 1',
    action: PlayLowestNumberAction | BeginGameAction | JoinGameAction
})


//actions to emit
//join game <-- this handles leaving any games you might already be in
socket.emit('GAME_ACTION', {
    gameId: 'my game 1',
    action: {
        type: 'JoinGameAction',
        userId: 'andrealized'
    }
})

//begin game
socket.emit('GAME_ACTION', {
    gameId: 'my game 1',
    action: {
        type: 'BeginGameAction',
        userId: 'andrealized'
    }
})

//play number
socket.emit('GAME_ACTION', {
    gameId: 'my game 1',
    action: {
        type: 'PlayLowestNumberAction',
        userId: 'andrealized'
    }
})
*/