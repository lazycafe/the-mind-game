import produce from "immer"
const _ = require('lodash');

const max_players = 5;

export type GameState = {
    id: string
    round: number
    gameLeaderPlayerId: string
    gameStatus: 'HAS_NOT_BEGUN' | 'WAITING_FOR_NEXT_ROUND' | 'IN_PROGRESS' | 'LOST' | 'WON',
    playerStates: {
        [playerId: string]: PlayerState
    },
    discardedCards: number[]
    lives: number
}

type PlayerState = {
    id: string
    cards: number[]
}

export function getDefaultGameState(id: string): GameState {
    return {
        id,
        round: 0,
        gameLeaderPlayerId: '',
        gameStatus: 'HAS_NOT_BEGUN',
        playerStates: {},
        discardedCards: [],
        lives: 0
    }
}

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

type BeginNextRoundAction = {
    type: 'BeginNextRoundAction'
}

function getStartingHands(numPlayers: number, handSize: number): number[][] {
    
    let numbersFromZeroToHundred = _.range(1, 101);
    let shuffledNumbers = shuffle(numbersFromZeroToHundred);

    let startIndex = 0;
    return _.range(0, numPlayers).map((playerNumber: number) => {
        let endIndex = startIndex + handSize;
        let hand =  shuffledNumbers.slice(startIndex, endIndex);
        startIndex = endIndex;
        return hand;
    });
}

function canExecuteJoinGameAction(action: JoinGameAction, state: GameState) {
    return state.gameStatus === 'HAS_NOT_BEGUN'
        && !state.playerStates[action.userId]
        && Object.keys(state.playerStates).length < 5;
}

function canExecutePlayLowestNumberAction(action: PlayLowestNumberAction, state: GameState): boolean {
    return state.playerStates[action.userId]
        && state.playerStates[action.userId].cards.length > 0
        && state.gameStatus === 'IN_PROGRESS';
}

function canExecuteBeginGameAction(action: BeginGameAction, state: GameState): boolean {
    return action.userId === state.gameLeaderPlayerId
        && Object.keys(state.playerStates).length > 1
        && state.gameStatus === 'HAS_NOT_BEGUN';
}

export function getMaxRounds(state: GameState) {
    const numPlayers = Object.keys(state.playerStates).length;
    //2 => 12 rounds
    //3 => 10 rounds
    //4 => 8 rounds
    //5 => 6 rounds
    if (numPlayers <= 2) {
        return 12;
    } else if (numPlayers === 3) {
        return 10;
    } else if (numPlayers === 4) {
        return 8;
    } else if (numPlayers === 5) {
        return 6;
    }
}

export function doAllPlayersHaveZeroCards(state: GameState) {
    const allPlayers = Object.keys(state.playerStates).map(id => state.playerStates[id]);

    return allPlayers.length > 0
        && allPlayers.every(p => p.cards.length === 0);
}

function canExecuteBeginNextRoundAction(action: BeginNextRoundAction, state: GameState): boolean {
    return doAllPlayersHaveZeroCards(state);
}

export function gameStateReducer(actionIn: any, stateIn: GameState): GameState {
    return produce(stateIn, (gameState) => {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, gameState)) {
            let action: PlayLowestNumberAction = actionIn;
            let userState = gameState.playerStates[action.userId];
            let nextDiscard = userState.cards[0];
            userState.cards.shift();
            const numDiscarded = gameState.discardedCards.length;
            const lastDiscard = gameState.discardedCards[numDiscarded - 1];
            if (numDiscarded > 0 && lastDiscard > nextDiscard) {
                gameState.gameStatus = 'LOST';
            } else if (doAllPlayersHaveZeroCards(gameState) && gameState.round + 1 === getMaxRounds(gameState)) {
                gameState.gameStatus = 'WON'
            } else if (doAllPlayersHaveZeroCards(gameState)) {
                gameState.gameStatus = 'WAITING_FOR_NEXT_ROUND';
            }
            gameState.discardedCards.push(nextDiscard);
            
        } else if (
            (actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, gameState))
            || (actionIn.type === 'BeginNextRoundAction' && canExecuteBeginNextRoundAction(actionIn, gameState))
            ) {
            let action: BeginGameAction = actionIn;
            gameState.round = gameState.round + 1;
            gameState.gameStatus = 'IN_PROGRESS';
            gameState.discardedCards = [];
            let playerIds = Object.keys(gameState.playerStates);
            getStartingHands(playerIds.length, gameState.round).forEach((numbers, index) => {
                gameState.playerStates[playerIds[index]].cards = numbers.sort((a, b) => a-b);
            });

            if (actionIn.type === 'BeginGameAction') {
                gameState.lives = playerIds.length;
            }
        } else if (actionIn.type === 'JoinGameAction' && canExecuteJoinGameAction(actionIn, gameState)) {
            let action: JoinGameAction = actionIn;
            gameState.playerStates[action.userId] = {
                id: action.userId,
                cards: []
            }
            if (!gameState.gameLeaderPlayerId) {
                gameState.gameLeaderPlayerId = action.userId;
            }
        }
        return gameState;
    });

}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a: any) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}





