"use strict";
exports.__esModule = true;
var immer_1 = require("immer");
var _ = require('lodash');
function getDefaultGameState() {
    return {
        numPlayers: 0,
        gameLeaderPlayerId: '',
        gameStatus: 'HAS_NOT_BEGUN',
        playerStates: {},
        discardedCards: [],
        lives: 0
    };
}
exports.getDefaultGameState = getDefaultGameState;
function getStartingHand(numPlayers) {
    var numbersFromZeroToHundred = _.range(1, 101);
    var shuffledNumbers = shuffle(numbersFromZeroToHundred);
    var handSize = 100 / numPlayers;
    var startIndex = 0;
    return _.range(0, numPlayers).map(function (playerNumber) {
        var handSizeRounded = playerNumber == 0 ? Math.ceil(handSize) : Math.floor(handSize);
        return shuffledNumbers.slice(startIndex, startIndex + handSizeRounded);
    });
}
function canExecuteJoinGameAction(action, state) {
    return state.gameStatus === 'HAS_NOT_BEGUN'
        && !state.playerStates[action.userId];
}
function canExecutePlayLowestNumberAction(action, state) {
    return state.playerStates[action.userId]
        && state.playerStates[action.userId].cards.length > 0;
}
function canExecuteBeginGameAction(action, state) {
    return action.userId === state.gameLeaderPlayerId
        && state.numPlayers > 1
        && state.gameStatus === 'HAS_NOT_BEGUN';
}
function gameStateReducer(actionIn, stateIn) {
    return immer_1["default"](stateIn, function (gameState) {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, gameState)) {
            var action = actionIn;
            var userState = gameState.playerStates[action.userId];
            var numberToPlay = userState.cards[0];
            userState.cards.shift();
            var numDiscarded = gameState.discardedCards.length;
            if (numDiscarded < 99 && numDiscarded > 0 && gameState.discardedCards[numDiscarded - 1] < numberToPlay) {
                gameState.gameStatus = 'LOST';
            }
            else if (numDiscarded > 99) {
                gameState.gameStatus = 'WON';
            }
            gameState.discardedCards.push(numberToPlay);
        }
        else if (actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, gameState)) {
            var action = actionIn;
            gameState.gameStatus = 'IN_PROGRESS';
            var playerIds_1 = Object.keys(gameState.playerStates);
            getStartingHand(playerIds_1.length).forEach(function (numbers, index) {
                gameState.playerStates[playerIds_1[index]].cards = numbers;
            });
        }
        else if (actionIn.type === 'JoinGameAction' && canExecuteJoinGameAction(actionIn, gameState)) {
            var action = actionIn;
            gameState.playerStates[action.userId] = {
                id: action.userId,
                cards: []
            };
            if (!gameState.gameLeaderPlayerId) {
                gameState.gameLeaderPlayerId = action.userId;
            }
        }
        return gameState;
    });
}
exports.gameStateReducer = gameStateReducer;
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
