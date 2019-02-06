"use strict";
exports.__esModule = true;
var express = require("express");
var _ = require('lodash');
var gameLogic_1 = require("./gameLogic");
var gameStates = {};
var app = express();
app.set("port", process.env.PORT || 3000);
var http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
var io = require('socket.io')(http);
app.get('/', function (req, res) {
    res.json(gameStates);
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function (socket) {
    socket.on('GAME_ACTION', function (payload) {
        if (!gameStates[payload.roomId]) {
            gameStates[payload.roomId] = gameLogic_1.getDefaultGameState();
        }
        if (_.get(payload, 'action.type') === 'JoinGameAction') {
            io.sockets.manager.roomClients[socket.id].map(function (roomId) { return socket.leave(roomId); });
            socket.join(payload.roomId);
        }
        gameStates[payload.roomId] = gameLogic_1.gameStateReducer(payload.action, gameStates[payload.roomId]);
        io["in"](payload.roomId).emit('GAME_UPDATE', {
            lastAction: payload.action,
            state: gameStates[payload.roomId]
        });
    });
});
var server = http.listen(3000, function () {
    console.log('listening on *:3000');
});
