import produce from "immer"
import _ from 'lodash';
type GameState = {
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

function getDefaultState(): GameState {
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


function getStartingNumbers(numPlayers: number): number[][] {
    
    let numbersFromZeroToHundred = [];
    for (let i = 0; i < 100; i++) { numbersFromZeroToHundred.push(i); }
    let shuffledNumbers = shuffle(numbersFromZeroToHundred);

    let handSize = 100/numPlayers;



    
    return [];
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

function gameStateReducer(actionIn: any, stateIn: GameState): GameState {
    return produce(stateIn, (gameState) => {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, state)) {
            let action: PlayLowestNumberAction = actionIn;
            let userState = gameState.playerStates[action.userId];
            let numberToPlay = userState.cards[0];
            userState.cards.shift();
            const numDiscarded = gameState.discardedCards.length;
            if (numDiscarded < 99 && numDiscarded > 0 && gameState.discardedCards[numDiscarded - 1] < numberToPlay) {
                gameState.gameStatus = 'LOST';
            }
            gameState.discardedCards.push(numberToPlay);
            
        } else if (actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, state)) {
            let action: BeginGameAction = actionIn;
            gameState.gameStatus = 'IN_PROGRESS';

    
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





