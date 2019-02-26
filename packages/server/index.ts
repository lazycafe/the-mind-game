import { Server } from "colyseus";
import { createServer } from "http";
const express = require("express");
import { GameRoom } from "./GameRoom";
const { monitor } = require( "@colyseus/monitor");
var cors = require('cors');

const port = 2657;

const app = express();

app.use(cors())

const gameServer = new Server({
  server: createServer(app)
});

gameServer.register('game', GameRoom);

// Register monitor route AFTER registering your room handlers
app.use("/colyseus", monitor(gameServer));
gameServer.listen(port);