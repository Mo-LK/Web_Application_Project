import { GameHistory } from '@app/model/database/game-history';
import { PlayerData } from '@app/model/interfaces/player-data';
import { Coordinate } from '@common/coordinates';
import { Socket } from 'socket.io';

export const FIRST_PLAYER = 0;
export const SECOND_PLAYER = 1;
export const POSITION_NOT_VALID = -1;
export const LANGUAGE = 'fr-CA';
export const TIMEZONE = { timeZone: 'America/Montreal' };

export interface GameMode {
    firstPlayer: PlayerData;
    secondPlayer: PlayerData;
    getPlayerData(playerSocket: Socket, isOpponent: boolean): PlayerData;
    startTimer(room: string);
    stopTimer();
    start();
    setSurrenderSocketId(surrenderSocketId: string);
    isGameEnded(): boolean;
    getClue(): Coordinate[];
    isStillPlaying(): boolean;
    handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean>;
    removePlayer(playerSocket: Socket);
    incrementPlayerDifferenceCount?(playerSocket: Socket);
    saveWinner?(playerSocket: Socket): Promise<number>;
    addHistory(winner: string, surrender: boolean, gameType: string): GameHistory;
}
