import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { POSITION_NOT_FOUND } from '@app/components/chat-box/chat-box.component.constants';
import { PopupMessageComponent } from '@app/components/popup-message/popup-message.component';
import { SecondGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { LobbyIO } from '@common/lobby-io';
import { Message } from './lobby.service.constants';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    playerQueue: LobbyIO[];
    isInLobby: boolean;
    waitingRoomCards: string[];
    isGameCreator: boolean;
    private lobbyId: string;
    private isCallBackAlreadySet: boolean;

    constructor(private clientService: SocketClientService, private gameService: GameService, public dialog: MatDialog) {
        this.playerQueue = [];
        this.waitingRoomCards = [];
        this.isInLobby = false;
        this.isCallBackAlreadySet = false;
        this.isGameCreator = false;
    }

    handleSocket() {
        if (!this.isCallBackAlreadySet) {
            this.clientService.addCallbackToMessage('joinRequest', (lobbyData) => this.handleJoinRequest(JSON.parse(lobbyData as string) as LobbyIO));
            this.clientService.addCallbackToMessage('created', (lobbyData) => this.handleLobbyCreated(JSON.parse(lobbyData as string) as LobbyIO));
            this.clientService.addCallbackToMessage('cardDeleted', (cardDelete) => this.handleCardDelete(cardDelete as string), false);
            this.clientService.addCallbackToMessage('joinRequestAccepted', (acceptedPlayerData) =>
                this.handleAccept(JSON.parse(acceptedPlayerData as string) as LobbyIO),
            );
            this.clientService.addCallbackToMessage('joinRequestRejected', () => {
                this.dialog.closeAll();
                this.dialog.open(PopupMessageComponent, { data: { message: Message.HostReject } });
                this.isInLobby = false;
            });
            this.clientService.addCallbackToMessage('createAborted', (lobbyData) =>
                this.handleHostCancelGame((JSON.parse(lobbyData as string) as LobbyIO).cardId),
            );
            this.clientService.addCallbackToMessage('joinRequestAborted', (lobbyData) =>
                this.handlePlayerJoinAbort(JSON.parse(lobbyData as string) as LobbyIO),
            );
            this.clientService.addCallbackToMessage('connection', (cards) => {
                this.handleNewConnection(JSON.parse(cards as string) as string[]);
            });
            this.isCallBackAlreadySet = true;
        }
    }

    acceptPlayer(playerIndex: number) {
        this.playerQueue[playerIndex].firstPlayerId = this.clientService.socketId;
        this.playerQueue[playerIndex].firstPlayerName = this.gameService.selfName;
        this.clientService.send('joinRequestAccepted', JSON.stringify(this.playerQueue[playerIndex]));
        const opponentName: string | undefined = this.playerQueue[playerIndex].secondPlayerName;
        if (opponentName) this.gameService.initializeOpponent(opponentName);
        this.gameService.enterGame(this.gameService.selfName, this.gameService.opponentName);
        this.dialog.closeAll();
        this.isInLobby = false;
        this.handleGameDiscard(this.playerQueue[playerIndex].cardId);
        this.playerQueue = [];
    }

    denyPlayer(playerIndex: number) {
        this.clientService.send('joinRequestRejected', JSON.stringify(this.playerQueue[playerIndex]));
        this.playerQueue.splice(playerIndex, 1);
    }

    discardCreatedGame() {
        this.clientService.send(
            'createAborted',
            JSON.stringify({ cardId: this.gameService.gameData.id, firstMode: this.gameService.gameData.firstMode } as LobbyIO),
        );
        this.isInLobby = false;
        this.playerQueue = [];
    }

    enterLobby(isSolo: boolean) {
        this.isGameCreator =
            isSolo ||
            this.waitingRoomCards.findIndex((cardId) => {
                return cardId === this.gameService.gameData.id;
            }) === POSITION_NOT_FOUND;
        const data = this.isGameCreator
            ? JSON.stringify({
                  cardId: this.gameService.gameData.id,
                  firstMode: this.gameService.gameData.firstMode,
                  secondMode: isSolo ? SecondGameMode.SOLO : SecondGameMode.VERSUS,
                  firstPlayerName: this.gameService.selfName,
              } as LobbyIO)
            : JSON.stringify({
                  cardId: this.gameService.gameData.id,
                  firstMode: this.gameService.gameData.firstMode,
                  secondMode: SecondGameMode.VERSUS,
                  secondPlayerName: this.gameService.selfName,
              } as LobbyIO);
        this.clientService.send('addPlayer', data);
        this.isInLobby = !isSolo;
        this.lobbyId = this.gameService.gameData.id;
    }

    abandonWaitingRoom() {
        this.clientService.send(
            'joinRequestAborted',
            JSON.stringify({
                cardId: this.gameService.gameData.id,
                firstMode: this.gameService.gameData.firstMode,
                secondPlayerName: this.gameService.selfName,
                secondPlayerId: this.clientService.socketId,
            }),
        );
        this.isInLobby = false;
    }

    deleteCard(cardId: string) {
        this.clientService.send('cardDeleted', cardId);
    }

    private handleHostCancelGame(cardId: string) {
        this.waitingRoomCards.splice(this.waitingRoomCards.indexOf(cardId, 0), 1);
        if (this.isInLobby && cardId === this.lobbyId) {
            this.dialog.closeAll();
            this.isInLobby = false;
            this.dialog.open(PopupMessageComponent, { data: { message: Message.HostLeft } });
        }
    }

    private handleAccept(data: LobbyIO) {
        if (this.clientService.socketId === data.secondPlayerId) {
            if (data.firstPlayerName) this.gameService.initializeOpponent(data.firstPlayerName);
            this.gameService.enterGame(this.gameService.selfName, this.gameService.opponentName);
            this.dialog.closeAll();
            this.isInLobby = false;
        }
        this.handleGameDiscard(data.cardId);
    }

    private handleGameDiscard(cardId: string) {
        this.waitingRoomCards.splice(this.waitingRoomCards.indexOf(cardId, 0), 1);
        if (this.isInLobby && cardId === this.lobbyId) {
            this.dialog.closeAll();
            this.isInLobby = false;
            this.dialog.open(PopupMessageComponent, { data: { message: Message.HostChoseOther } });
        }
    }

    private handleLobbyCreated(data: LobbyIO) {
        this.waitingRoomCards.push(data.cardId);
    }

    private handlePlayerJoinAbort(data: LobbyIO) {
        const playerIndex = this.findPlayerIndexInQueue(data.secondPlayerId);
        if (playerIndex >= 0) this.playerQueue.splice(playerIndex, 1);
    }

    private findPlayerIndexInQueue(secondPlayerId?: string) {
        return this.playerQueue.findIndex((player) => player.secondPlayerId === secondPlayerId);
    }

    private handleNewConnection(cards: string[]) {
        cards.forEach((cardIdentifier) => {
            this.handleLobbyCreated({ cardId: cardIdentifier });
        });
    }

    private handleCardDelete(cardId: string) {
        this.waitingRoomCards.splice(this.waitingRoomCards.indexOf(cardId), 1);
        if (this.isInLobby && cardId === this.lobbyId) {
            this.dialog.closeAll();
            this.isInLobby = false;
            this.dialog.open(PopupMessageComponent, { data: { message: Message.CardDeleted } });
        }
    }

    private handleJoinRequest(lobbyData: LobbyIO) {
        this.playerQueue.push(lobbyData);
        if (!this.gameService.isClassicMode) this.acceptPlayer(0);
    }
}
