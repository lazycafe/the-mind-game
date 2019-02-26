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
    discardActions: {
        userName: string
        card: number
        wasLowestCard: boolean
    }[]
    lives: number
}

type PlayerState = {
    id: string
    name: string
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
        discardActions: [],
        lives: 0
    }
}

export type GameAction = PlayLowestNumberAction
    | BeginGameAction
    | JoinGameAction 
    | BeginNextRoundAction
    | LeaveGameAction
    | RestartGameAction;

export type PlayLowestNumberAction = {
    type: 'PlayLowestNumberAction'
    userId: string
}

export type BeginGameAction = {
    type: 'BeginGameAction'
    userId: string
}

export type RestartGameAction = {
    type: 'RestartGameAction'
    userId: string
}

export type JoinGameAction = {
    type: 'JoinGameAction'
    userId: string
    userName: string
}

export type LeaveGameAction = {
    type: 'LeaveGameAction'
    userId: string
}

export type BeginNextRoundAction = {
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

function canExecuteRestartGameAction(action: RestartGameAction, state: GameState) {
    return (state.gameStatus === 'LOST' || state.gameStatus === 'WON')
        && state.gameLeaderPlayerId === action.userId;
}

function canExecuteJoinGameAction(action: JoinGameAction, state: GameState) {
    return !state.playerStates[action.userId];
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

function canExecuteLeaveGameAction(action: LeaveGameAction, state: GameState) {
    return Boolean(state.playerStates[action.userId]);
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
    } else {
        return 5;
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

function isLowestCard(state: GameState, card: number) {
    const isLowestNumber = Object.keys(state.playerStates)
        .map(id => state.playerStates[id].cards)
        .reduce(
            function(accumulator, currentValue) {
            return accumulator.concat(currentValue);
            },
            []
        )
        .filter(num => num < card)
        .length === 0;
    return isLowestNumber;
}

function loseLifeIfLastCardDiscardedWasntLowest(state: GameState, nextDiscard: number) {
    const didDiscardLowest = isLowestCard(state, nextDiscard);
    console.log('should lose life?', !didDiscardLowest);
    if (!didDiscardLowest) {
        state.lives = state.lives - 1;
    } 
}

function updateGameStatus(gameState: GameState) {
    if (gameState.gameStatus !== 'IN_PROGRESS') { return; }

    if (gameState.lives === 0) {
        gameState.gameStatus = 'LOST';
    } else if (doAllPlayersHaveZeroCards(gameState) && gameState.round + 1 > getMaxRounds(gameState)) {
        gameState.gameStatus = 'WON'
    } else if (doAllPlayersHaveZeroCards(gameState)) {
        gameState.gameStatus = 'WAITING_FOR_NEXT_ROUND';
    }
}

function ensureThereIsAGameLeader(gameState: GameState) {
    if (!gameState.gameLeaderPlayerId) {
        const players = Object.keys(gameState.playerStates);
        if (players.length > 0) {
            gameState.gameLeaderPlayerId = players[0];
        }
    }
}

export function gameStateReducer(actionIn: GameAction, stateIn: GameState): GameState {
    console.log('game: ', stateIn.id, 'action: ', actionIn);
    return produce(stateIn, (gameState) => {
        if (actionIn.type === 'PlayLowestNumberAction' && canExecutePlayLowestNumberAction(actionIn, gameState)) {
            let action: PlayLowestNumberAction = actionIn;
            let userState = gameState.playerStates[action.userId];
            let nextDiscard = userState.cards[0];
            userState.cards.shift();
            loseLifeIfLastCardDiscardedWasntLowest(gameState, nextDiscard);
            updateGameStatus(gameState);
            gameState.discardedCards.push(nextDiscard);
            gameState.discardActions.push({
                card: nextDiscard,
                wasLowestCard: isLowestCard(gameState, nextDiscard),
                userName: userState.name
            });
        } else if (
            (actionIn.type === 'BeginGameAction' && canExecuteBeginGameAction(actionIn, gameState))
            || (actionIn.type === 'BeginNextRoundAction' && canExecuteBeginNextRoundAction(actionIn, gameState))
            ) {
            gameState.round = gameState.round + 1;
            gameState.gameStatus = 'IN_PROGRESS';
            gameState.discardedCards = [];
            gameState.discardActions = [];
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
                name: action.userName,
                cards: []
            }
            ensureThereIsAGameLeader(gameState);
        } else if (actionIn.type === 'LeaveGameAction' && canExecuteLeaveGameAction(actionIn, gameState)) {
            let action: LeaveGameAction = actionIn;
            delete gameState.playerStates[action.userId]
            if (gameState.gameLeaderPlayerId === actionIn.userId) {
                gameState.gameLeaderPlayerId = '';
                ensureThereIsAGameLeader(gameState);
            }
            updateGameStatus(gameState);
        } else if (actionIn.type === 'RestartGameAction' && canExecuteRestartGameAction(actionIn, gameState)) {
            let action: RestartGameAction = actionIn;
            const nextState = getDefaultGameState(gameState.id);
            nextState.gameStatus = 'HAS_NOT_BEGUN';
            nextState.gameLeaderPlayerId = gameState.gameLeaderPlayerId;
            Object.keys(gameState.playerStates).forEach(userId => {
                const oldUserState = gameState.playerStates[userId];
                nextState.playerStates[userId] = {
                    id: userId,
                    name: oldUserState.name,
                    cards: []
                };
            });
            return nextState;
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





