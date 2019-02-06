"use strict";
exports.__esModule = true;
var express = require("express");
var _ = require('lodash');
var cors = require('cors');
var gameLogic_1 = require("./gameLogic");
var gameStates = {};
var app = express();
app.use(cors());
var http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
var io = require('socket.io')(http);
app.get('/', function (req, res) {
    res.json(gameStates);
});
function updateGameState(gameId, gameState, lastAction) {
    io["in"](gameId).emit('GAME_UPDATE', {
        lastAction: lastAction,
        state: gameState
    });
    gameStates[gameId] = gameState;
}
io.set('origins', '*:*');
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function (socket) {
    socket.on('ECHO', function (payload) {
        socket.emit('ECHO', payload);
    });
    socket.on('GAME_ACTION', function (payload) {
        if (!gameStates[payload.gameId]) {
            gameStates[payload.gameId] = gameLogic_1.getDefaultGameState();
        }
        if (_.get(payload, 'action.type') === 'JoinGameAction') {
            io.sockets.manager.roomClients[socket.id].map(function (roomId) { return socket.leave(roomId); });
            socket.join(payload.gameId);
        }
        var oldGameState = gameStates[payload.gameId];
        var nextGameState = gameLogic_1.gameStateReducer(payload.action, oldGameState);
        updateGameState(payload.gameId, nextGameState, payload.action);
        if (_.get(payload, 'action.type') === 'PlayLowestNumberAction' && nextGameState.gameStatus === 'WAITING_FOR_NEXT_ROUND') {
            setTimeout(function () {
                var nextRoundGameState = gameLogic_1.gameStateReducer({
                    type: 'BeginNextRoundAction'
                }, nextGameState);
                updateGameState(payload.gameId, nextRoundGameState, payload.action);
            }, 5000);
        }
    });
});
var server = http.listen(1234, function () {
    console.log('listening on *:1234');
});
var exampleGameState = {
    round: 1,
    gameLeaderPlayerId: '',
    gameStatus: 'IN_PROGRESS',
    playerStates: {
        'andrealized': {
            id: 'andrealized',
            cards: [15, 27, 22]
        },
        'jmoneyswagtime': {
            id: 'jmoneyswagtime',
            cards: [4, 89, 24]
        }
    },
    discardedCards: [],
    lives: 0
};
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
