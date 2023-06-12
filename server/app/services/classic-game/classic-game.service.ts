import { PlayerStats } from '@app/model/database/player-stats';
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { FirstGameMode, TIMER_INTERVAL, TIME_DIVIDE_FACTOR } from '@app/services/game-manager/game-manager.service.constants';
import { GameService } from '@app/services/game/game.service';
import { FIRST_PLAYER, GameMode, POSITION_NOT_VALID } from '@app/services/game/game.service.constants';
import { StatsService } from '@app/services/stats/stats.service';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { SuccessClick } from '@common/success-click';
import { Winner } from '@common/winner';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ClassicGameService extends GameService implements GameMode {
    private differencesFound: Coordinate[][];
    private totalDifferenceCount: number;
    private card: Card;

    // Allowed to have more than 3 parameters since most are services (Approved by Mike, 13/03/2023)
    // eslint-disable-next-line max-params
    constructor(
        server: Server,
        dbService: DatabaseService,
        cardService: CardService,
        players: PlayerData[],
        constants: GameConstants,
        private statService: StatsService = new StatsService(dbService),
    ) {
        super(server, cardService, players, constants, dbService);
        this.gameTimer = { timer: null, counter: 0 };
    }

    isGameEnded(): boolean {
        let isFoundAllDifferences = false;
        for (const player of this.playerData) {
            if (player.foundDifferencesCount >= Math.ceil(this.totalDifferenceCount / this.playerData.length)) {
                isFoundAllDifferences = true;
                break;
            }
        }
        return isFoundAllDifferences;
    }

    async handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean> {
        let gameIsEnded = false;
        const foundDifference = await this.validateClick(coord);
        const playerName = this.getPlayerData(playerSocket, false).name;

        if (foundDifference) {
            this.incrementPlayerDifferenceCount(playerSocket);
            this.server.to(room).emit('success', JSON.stringify({ socketId: playerSocket.id, differences: foundDifference } as SuccessClick));
            this.server
                .to(room)
                .emit('message', JSON.stringify({ message: 'Différence trouvée par ' + playerName, type: ChatEntryType.EVENT } as ChatEntry));

            gameIsEnded = this.isGameEnded();
            if (gameIsEnded) {
                const position = await this.saveWinner(playerSocket);
                this.server.to(room).emit('winner', JSON.stringify({ socketId: playerSocket.id, leaderboardPosition: position } as Winner));
                this.stopTimer();
                const newGameHistory = this.addHistory(playerSocket.id, false, FirstGameMode.CLASSIC);
                if (position) {
                    const positionMessage = `${playerName} obtient la ${position} place dans les meilleurs
                        temps du jeu ${this.card.title} en ${playerSocket.data.secondMode}`;
                    this.server.emit('message', JSON.stringify({ message: positionMessage, type: ChatEntryType.GLOBAL } as ChatEntry));
                }
                this.server.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
            }
        } else {
            playerSocket.emit('error', JSON.stringify(coord));
            this.server.to(room).emit('message', JSON.stringify({ message: 'Erreur par ' + playerName, type: ChatEntryType.EVENT } as ChatEntry));
        }

        return gameIsEnded;
    }

    incrementPlayerDifferenceCount(playerSocket: Socket) {
        this.playerData.forEach((playerData) => {
            if (playerData.socket === playerSocket) {
                playerData.foundDifferencesCount++;
            }
        });
    }

    startTimer(room: string): void {
        if (!this.gameTimer.timer) {
            this.room = room;
            let increment = true;
            this.gameTimer.timer = setInterval(() => {
                this.server.to(room).emit('clock', this.gameTimer.counter.toString());
                if (increment) this.gameTimer.counter++;
                increment = !increment;
            }, TIMER_INTERVAL);
        }
    }

    stopTimer(): void {
        clearInterval(this.gameTimer.timer);
        const endTime = new Date().getTime();
        this.timeLength = ((endTime - this.timestampStart.getTime()) / TIME_DIVIDE_FACTOR).toString();
    }

    async start(): Promise<void> {
        this.card = await this.cardService.getCard(this.playerData[FIRST_PLAYER].cardId);
        this.server.to(this.room).emit('constants', JSON.stringify(this.constants as GameConstants));
        this.differencesFound = new Array<Coordinate[]>();
        this.totalDifferenceCount = this.card.differences.length;
    }

    async saveWinner(playerSocket: Socket): Promise<number> {
        const winnerTime = this.gameTimer.counter;
        const player = this.getPlayerData(playerSocket, false);
        const winnerStat: PlayerStats = {
            cardId: this.card.id,
            firstMode: playerSocket.data.firstMode,
            secondMode: playerSocket.data.secondMode,
            playerName: player.name,
            score: winnerTime,
        } as PlayerStats;
        const position = await this.statService.addStat(winnerStat);
        const stats = await this.statService.getCardStats(this.card.id);
        this.cardService.updateClientStats({
            id: this.card.id,
            stats: stats as CardStats,
        } as Card);

        return position === POSITION_NOT_VALID ? null : position;
    }

    getTotalDifferenceCount(): number {
        return this.totalDifferenceCount;
    }

    getClue(): Coordinate[] {
        if (this.clueCounter < 3) {
            this.gameTimer.counter += this.constants.penalty;
            const remainingDifferences = this.getRemainingDifferences();
            return this.getClueDifference(remainingDifferences);
        }
        return null;
    }

    private getRemainingDifferences() {
        const differences: Coordinate[][] = [];
        this.card.differences.forEach((difference) => {
            if (!this.isAlreadyFound(difference)) differences.push(difference);
        });

        return differences;
    }

    private async validateClick(coord: Coordinate): Promise<Coordinate[]> {
        const coords = await this.cardService.getDifferenceFromPixel(this.card.id, coord, this.card.differences);
        if (coords && !this.isAlreadyFound(coords)) {
            this.differencesFound.push(coords);
            return coords;
        }
        return null;
    }

    private isAlreadyFound(differenceArray: Coordinate[]) {
        return (
            this.differencesFound.length !== 0 &&
            this.differencesFound.some((difference: Coordinate[]) => {
                return difference[0].x === Number(differenceArray[0].x) && difference[0].y === Number(differenceArray[0].y);
            })
        );
    }
}
