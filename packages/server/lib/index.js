"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const http_1 = require("http");
const express = require("express");
const GameRoom_1 = require("./GameRoom");
const { monitor } = require("@colyseus/monitor");
var cors = require('cors');
const port = 2657;
const app = express();
app.use(cors());
const gameServer = new colyseus_1.Server({
    server: http_1.createServer(app)
});
gameServer.register('game', GameRoom_1.GameRoom);
// Register monitor route AFTER registering your room handlers
app.use("/colyseus", monitor(gameServer));
gameServer.listen(port);
