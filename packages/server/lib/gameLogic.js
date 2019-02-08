"use strict";
exports.__esModule = true;
var immer_1 = require("immer");
var _ = require('lodash');
var max_players = 5;
function getDefaultGameState(id) {
    return {
        id: id,
        round: 0,
        gameLeaderPlayerId: '',
        gameStatus: 'HAS_NOT_BEGUN',
        playerStates: {},
        discardedCards: [],
        lives: 0
    };
}
exports.getDefaultGameState = getDefaultGameState;
function getStartingHand(numPlayers, handSize) {
    var numbersFromZeroToHundred = _.range(1, 101);
    var shuffledNumbers = shuffle(numbersFromZeroToHundred);
    var startIndex = 0;
    return _.range(0, numPlayers).map(function (playerNumber) {
        var endIndex = startIndex + handSize;
        var hand = shuffledNumbers.slice(startIndex, endIndex);
        startIndex = endIndex;
        return hand;
    });
}
function canExecuteJoinGameAction(action, state) {
    return state.gameStatus === 'HAS_NOT_BEGUN'
        && !state.playerStates[action.userId]
        && Object.keys(state.playerStates).length < 5;
}
function canExecutePlayLowestNumberAction(action, state) {
    return state.playerStates[action.userId]
        && state.playerStates[action.userId].cards.length > 0
        && state.gameStatus === 'IN_PROGRESS';
}
function canExecuteBeginGameAction(action, state) {
    return action.userId === state.gameLeaderPlayerId
        && Object.keys(state.playerStates).length > 1
        && state.gameStatus === 'HAS_NOT_BEGUN';
}
function getMaxRounds(state) {
    var numPlayers = Object.keys(state.playerStates).length;
    //2 => 12 rounds
    //3 => 10 rounds
    //4 => 8 rounds
    //5 => 6 rounds
    if (numPlayers <= 2) {
        return 12;
    }
    else if (numPlayers === 3) {
        return 10;
    }
    else if (numPlayers === 4) {
        return 8;
    }
    else if (numPlayers === 5) {
        return 6;
    }
}
exports.getMaxRounds = getMaxRounds;
function doAllPlayersHaveZeroCards(state) {
    var allPlayers = Object.keys(state.playerStates).map(function (id) { return state.playerStates[id]; });
    return allPlayers.length > 0
        && allPlayers.every(function (p) { return p.cards.length === 0; });
}
exports.doAllPlayersHaveZeroCards = doAllPlayersHaveZeroCards;
function canExecuteBeginNextRoundAction(action, state) {
    return doAllPlayersHaveZeroCards(state);
}
function gameStateReducer(actionIn, stateIn) {
    return immer_1["default"](stateIn, function (gameState) {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, gameState)) {
            var action = actionIn;
            var userState = gameState.playerStates[action.userId];
            var numberToPlay = userState.cards[0];
            userState.cards.shift();
            var numDiscarded = gameState.discardedCards.length;
            if (numDiscarded > 0 && gameState.discardedCards[numDiscarded - 1] < numberToPlay) {
                gameState.gameStatus = 'LOST';
            }
            else if (doAllPlayersHaveZeroCards(gameState) && gameState.round + 1 === getMaxRounds(gameState)) {
                gameState.gameStatus = 'WON';
            }
            else if (doAllPlayersHaveZeroCards(gameState)) {
                gameState.gameStatus = 'WAITING_FOR_NEXT_ROUND';
            }
            gameState.discardedCards.push(numberToPlay);
        }
        else if ((actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, gameState))
            || (actionIn.type === 'BeginNextRoundAction' && canExecuteBeginNextRoundAction(actionIn, gameState))) {
            var action = actionIn;
            gameState.round = gameState.round + 1;
            gameState.gameStatus = 'IN_PROGRESS';
            gameState.discardedCards = [];
            var playerIds_1 = Object.keys(gameState.playerStates);
            getStartingHand(playerIds_1.length, gameState.round).forEach(function (numbers, index) {
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
