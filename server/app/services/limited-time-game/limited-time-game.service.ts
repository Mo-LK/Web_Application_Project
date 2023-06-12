import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { FirstGameMode, TIMER_INTERVAL, TIME_DIVIDE_FACTOR } from '@app/services/game-manager/game-manager.service.constants';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@app/services/game/game.service.constants';
import { TIMER_MAX_VALUE } from '@app/services/limited-time-game/limited-time-game.service.constants';
import { Card } from '@common/card';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { SuccessClick } from '@common/success-click';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class LimitedTimeGameService extends GameService implements GameMode {
    differenceFoundCount: number;
    private currentCardIndex: number;
    private cards: Card[];
    private gameIsEnded: boolean;

    // Ok to disable because service needs all parameters to function
    // eslint-disable-next-line max-params
    constructor(server: Server, cardService: CardService, players: PlayerData[], constants: GameConstants, dbService: DatabaseService) {
        super(server, cardService, players, constants, dbService);
        this.currentCardIndex = 0;
        this.differenceFoundCount = 0;
        this.gameIsEnded = false;
        this.gameTimer = { timer: null, counter: TIMER_MAX_VALUE };
    }

    get currentCard(): Card {
        return this.cards[this.currentCardIndex];
    }

    async start() {
        await this.generateRandomCardsOrder();
        this.server.to(this.room).emit('cardChange', JSON.stringify(this.currentCard as Card));
        this.server.to(this.room).emit('constants', JSON.stringify(this.constants as GameConstants));
    }

    isGameEnded(): boolean {
        return this.gameIsEnded;
    }

    async handleClick(room: string, coord: Coordinate, playerSocket: Socket): Promise<boolean> {
        const coords = await this.cardService.getDifferenceFromPixel(this.currentCard.id, coord, this.currentCard.differences);
        const playerName = this.getPlayerData(playerSocket, false).name;
        if (coords) {
            this.currentCardIndex++;
            this.differenceFoundCount++;
            this.server.to(room).emit('success', JSON.stringify({ socketId: playerSocket.id, differences: coords } as SuccessClick));
            this.server
                .to(room)
                .emit('message', JSON.stringify({ message: 'Différence trouvée par ' + playerName, type: ChatEntryType.EVENT } as ChatEntry));

            if (this.currentCardIndex !== this.cards.length) {
                this.server.to(this.room).emit('cardChange', JSON.stringify(this.currentCard as Card));
                this.gameTimer.counter += this.constants.gain;
                if (this.gameTimer.counter > TIMER_MAX_VALUE) this.gameTimer.counter = TIMER_MAX_VALUE;
            } else {
                this.endGame(true, playerSocket.id);
            }
        } else {
            playerSocket.emit('error', JSON.stringify(coord));
            this.server.to(room).emit('message', JSON.stringify({ message: 'Erreur par ' + playerName, type: ChatEntryType.EVENT } as ChatEntry));
        }

        return this.gameIsEnded;
    }

    startTimer(room: string) {
        if (!this.gameTimer.timer) {
            this.gameTimer.counter = this.constants.initial;
            this.room = room;
            let increment = true;
            this.gameTimer.timer = setInterval(() => {
                if (this.gameTimer.counter === 0) this.endGame(false);
                this.server.to(room).emit('clock', this.gameTimer.counter.toString());
                if (increment) this.gameTimer.counter--;
                increment = !increment;
            }, TIMER_INTERVAL);
        }
    }

    stopTimer() {
        clearInterval(this.gameTimer.timer);
        const endTime = new Date().getTime();
        this.timeLength = ((endTime - this.timestampStart.getTime()) / TIME_DIVIDE_FACTOR).toString();
    }

    getClue(): Coordinate[] {
        if (this.clueCounter < 3) {
            this.gameTimer.counter -= this.constants.penalty;
            if (this.gameTimer.counter < 0) this.gameTimer.counter = 0;
            return this.getClueDifference(this.currentCard.differences);
        }
        return null;
    }

    private async generateRandomCardsOrder() {
        // Algorithm source : https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        this.cards = (await this.cardService.getAllCards())
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    private endGame(isWinner: boolean, playerSocketId: string = ' ') {
        this.server.to(this.room).emit('endGame', JSON.stringify(isWinner));
        this.gameIsEnded = true;
        this.stopTimer();
        const newGameHistory = this.addHistory(playerSocketId, this.playerData.length === 0, FirstGameMode.LIMITED_TIME);
        this.server.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
    }
}
