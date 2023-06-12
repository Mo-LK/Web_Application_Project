import { Injectable } from '@angular/core';
import { GameHistory } from '@app/interfaces/history';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    history: GameHistory[];
    constructor(protected comService: CommunicationService, protected socketService: SocketClientService) {
        this.history = [];
        this.handleSocket();
        this.loadHistory();
    }

    async deleteHistory() {
        await firstValueFrom(this.comService.deleteRequest('card/history'));
        this.history = [];
    }

    handleSocket() {
        this.socketService.addCallbackToMessage('historyChanged', (data) =>
            this.handleHistoryChanged(JSON.parse(data as string).history as GameHistory),
        );
        this.socketService.addCallbackToMessage(
            'resetHistory',
            () => {
                this.history = [];
            },
            false,
        );
    }

    private async loadHistory() {
        const historyRequest = await firstValueFrom(this.comService.getRequest('card/history'));
        this.history = JSON.parse(historyRequest.body);
    }

    private handleHistoryChanged(gameHistory: GameHistory) {
        this.history.unshift(gameHistory);
    }
}
