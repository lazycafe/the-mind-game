const express = require("express");
import * as socketio from "socket.io";
import * as path from "path"
const _ = require('lodash');
import { GameState, getDefaultGameState, gameStateReducer } from "./gameLogic";

const gameStates: {[gameId: string]: GameState} = {};

const app = express();
app.set("port", process.env.PORT || 3000);

let http = require('http').Server(app);
// set up socket.io and bind it to our
// http server.
let io = require('socket.io')(http);


app.get('/', (req: any, res: any) => {
  res.json(gameStates);
});



type RoomAction = {
    action: any
    userId: string
    roomId: string
}

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on('connection', function(socket: any){

  socket.on('GAME_ACTION', (payload: RoomAction) => {

    if (!gameStates[payload.roomId]) {
        gameStates[payload.roomId] = getDefaultGameState();
    }

    if (_.get(payload, 'action.type') === 'JoinGameAction') {
        io.sockets.manager.roomClients[socket.id].map((roomId: string) => socket.leave(roomId));
        socket.join(payload.roomId);
    }

    gameStates[payload.roomId] = gameStateReducer(payload.action, gameStates[payload.roomId]);

    io.in(payload.roomId).emit('GAME_UPDATE', {
        lastAction: payload.action,
        state: gameStates[payload.roomId]
    })
  });
});

const server = http.listen(3000, function(){
  console.log('listening on *:3000');
});