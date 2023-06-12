import { Card } from '@common/card';
import { GameConstants } from '@common/game-constants';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NAMESPACE } from './cards-manager.gateway.constants';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
export class CardsManagerGateway {
    @WebSocketServer()
    private serverSocket: Server;

    handleDeletedCard(cardId: string, cardsLength: number) {
        this.serverSocket.emit('cardDeleted', cardId);
        this.handleLimitedModeEnable(cardsLength);
    }

    handleCreatedCard(cardData: Card) {
        this.serverSocket.emit('cardCreated', JSON.stringify(cardData));
        this.serverSocket.emit('limitedModeEnable', JSON.stringify(true));
    }

    handleStatChanged(card: Card) {
        this.serverSocket.emit('statsChanged', JSON.stringify(card));
    }

    handleConstantChanged(constants: GameConstants) {
        this.serverSocket.emit('constantsChanged', JSON.stringify(constants));
    }

    handleLimitedModeEnable(cardsLength: number) {
        this.serverSocket.emit('limitedModeEnable', JSON.stringify(cardsLength !== 0));
    }

    notifyResetHistory() {
        this.serverSocket.emit('resetHistory');
    }
}
