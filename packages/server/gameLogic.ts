import produce from "immer"
const _ = require('lodash');

export type GameState = {
    numPlayers: number
    gameLeaderPlayerId: string
    gameStatus: 'HAS_NOT_BEGUN' | 'IN_PROGRESS' | 'LOST' | 'WON',
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

export function getDefaultGameState(): GameState {
    return {
        numPlayers: 0,
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

function getStartingHand(numPlayers: number): number[][] {
    
    let numbersFromZeroToHundred = _.range(1, 101);
    let shuffledNumbers = shuffle(numbersFromZeroToHundred);

    let handSize = 100/numPlayers;

    let startIndex = 0;
    return _.range(0, numPlayers).map((playerNumber: number) => {
        let handSizeRounded: number = playerNumber == 0 ? Math.ceil(handSize): Math.floor(handSize);
        return shuffledNumbers.slice(startIndex, startIndex + handSizeRounded);
    });
}

function canExecuteJoinGameAction(action: JoinGameAction, state: GameState) {
    return state.gameStatus === 'HAS_NOT_BEGUN'
        && !state.playerStates[action.userId];
}

function canExecutePlayLowestNumberAction(action: PlayLowestNumberAction, state: GameState): boolean {
    return state.playerStates[action.userId]
        && state.playerStates[action.userId].cards.length > 0;
}

function canExecuteBeginGameAction(action: BeginGameAction, state: GameState): boolean {
    return action.userId === state.gameLeaderPlayerId
        &&state.numPlayers > 1
        && state.gameStatus === 'HAS_NOT_BEGUN';
}

export function gameStateReducer(actionIn: any, stateIn: GameState): GameState {
    return produce(stateIn, (gameState) => {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, gameState)) {
            let action: PlayLowestNumberAction = actionIn;
            let userState = gameState.playerStates[action.userId];
            let numberToPlay = userState.cards[0];
            userState.cards.shift();
            const numDiscarded = gameState.discardedCards.length;
            if (numDiscarded < 99 && numDiscarded > 0 && gameState.discardedCards[numDiscarded - 1] < numberToPlay) {
                gameState.gameStatus = 'LOST';
            } else if (numDiscarded > 99) {
                gameState.gameStatus = 'WON'
            }
            gameState.discardedCards.push(numberToPlay);
            
        } else if (actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, gameState)) {
            let action: BeginGameAction = actionIn;
            gameState.gameStatus = 'IN_PROGRESS';
            let playerIds = Object.keys(gameState.playerStates);
            getStartingHand(playerIds.length).forEach((numbers, index) => {
                gameState.playerStates[playerIds[index]].cards = numbers;
            })
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





