import { Component } from '@angular/core';
import { GameHistory } from '@app/interfaces/history';
import { HistoryService } from '@app/services/history/history.service';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
    emptyHistory: boolean;
    confirmationPrompt: boolean;
    constructor(protected historyService: HistoryService) {
        this.emptyHistory = this.historyService.history.length === 0;
        this.confirmationPrompt = false;
    }

    back() {
        this.confirmationPrompt = false;
    }

    promptConfirmation() {
        this.confirmationPrompt = true;
    }

    clearMatchHistory() {
        this.historyService.deleteHistory();
        this.emptyHistory = true;
        this.confirmationPrompt = false;
    }

    establishSurrender(gameHistory: GameHistory, isFirstPlayer: boolean) {
        if (gameHistory.gameType === 'Temps limité') {
            if (isFirstPlayer)
                return (
                    gameHistory.surrenderSocketId === gameHistory.firstPlayerSocketId ||
                    (gameHistory.surrenderSocketId === gameHistory.secondPlayerSocketId && gameHistory.surrender)
                );
            return (
                gameHistory.surrenderSocketId === gameHistory.secondPlayerSocketId ||
                (gameHistory.surrenderSocketId === gameHistory.firstPlayerSocketId && gameHistory.surrender)
            );
        }
        if (isFirstPlayer) return gameHistory.surrender && gameHistory.winnerSocketId !== gameHistory.firstPlayerSocketId;
        return gameHistory.surrender && gameHistory.winnerSocketId !== gameHistory.secondPlayerSocketId;
    }

    establishWinner(gameHistory: GameHistory, isFirstPlayer: boolean, isLimited: boolean) {
        if (isLimited && gameHistory.winnerSocketId !== ' ') return true;
        if (isFirstPlayer) return gameHistory.firstPlayerSocketId === gameHistory.winnerSocketId;
        return gameHistory.secondPlayerSocketId === gameHistory.winnerSocketId;
    }
}
