import { GameHistory } from '@app/model/database/game-history';
import { GameTimer } from '@app/model/interfaces/game-timer';
import { HistoryData } from '@app/model/interfaces/history-data';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { HistoryService } from '@app/services/history/history.service';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FIRST_PLAYER, LANGUAGE, SECOND_PLAYER, TIMEZONE } from './game.service.constants';

@Injectable()
export class GameService {
    protected room: string;
    protected playerData: PlayerData[];
    protected historyData: HistoryData[];
    protected gameTimer: GameTimer;
    protected clueCounter: number;
    protected timestampStart: Date;
    protected timeLength: string;
    protected surrenderSocketId: string;

    // Ok to disable because service needs all parameters to function
    // eslint-disable-next-line max-params
    constructor(
        protected readonly server: Server,
        protected cardService: CardService,
        protected players: PlayerData[],
        protected constants: GameConstants,
        protected dbService: DatabaseService,
        protected historyService: HistoryService = new HistoryService(dbService),
    ) {
        this.playerData = players;
        this.timestampStart = new Date();
        this.clueCounter = 0;
        this.historyData = this.playerData.map(({ name, socket }) => Object.assign({}, { name, socketId: socket.id }));
        this.surrenderSocketId = ' ';
    }

    get firstPlayer(): PlayerData {
        return this.playerData[FIRST_PLAYER];
    }

    get secondPlayer(): PlayerData {
        return this.playerData[SECOND_PLAYER];
    }

    setSurrenderSocketId(surrenderSocketId: string) {
        this.surrenderSocketId = surrenderSocketId;
    }

    isStillPlaying() {
        return this.playerData.length >= 1;
    }

    removePlayer(playerSocket: Socket) {
        if (this.firstPlayer.socket === playerSocket) this.playerData.shift();
        else this.playerData.pop();
    }

    getPlayerData(player: Socket, getOpponent: boolean): PlayerData {
        const isFirstPlayer = this.playerData[FIRST_PLAYER].socket === player;
        return (isFirstPlayer && getOpponent) || (!isFirstPlayer && !getOpponent) ? this.secondPlayer : this.firstPlayer;
    }

    addHistory(winnerSocketId: string, surrender: boolean, gameType: string): GameHistory {
        const history: GameHistory = {
            dateStarted: this.timestampStart.toLocaleDateString(LANGUAGE, TIMEZONE),
            timeStarted: this.timestampStart.toLocaleTimeString(LANGUAGE, TIMEZONE),
            timeLength: this.timeLength,
            gameType,
            firstPlayer: this.historyData[FIRST_PLAYER].name,
            secondPlayer: this.historyData[SECOND_PLAYER] ? this.historyData[SECOND_PLAYER].name : ' ',
            winnerSocketId,
            surrender,
            surrenderSocketId: this.surrenderSocketId,
            firstPlayerSocketId: this.historyData[FIRST_PLAYER].socketId,
            secondPlayerSocketId: this.historyData[SECOND_PLAYER] ? this.historyData[SECOND_PLAYER].socketId : ' ',
        } as GameHistory;
        this.historyService.createHistory(history);
        return history;
    }

    protected getClueDifference(differencesArray: Coordinate[][]) {
        this.clueCounter++;
        return this.getRandomDifference(differencesArray);
    }

    private getRandomDifference(difference: Coordinate[][]): Coordinate[] {
        const randomIndex = Math.floor(Math.random() * difference.length);
        return difference[randomIndex];
    }
}
