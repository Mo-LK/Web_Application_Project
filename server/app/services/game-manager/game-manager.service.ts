import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { ClassicGameService } from '@app/services/classic-game/classic-game.service';
import { DatabaseService } from '@app/services/database/database.service';
import { GameMode } from '@app/services/game/game.service.constants';
import { LimitedTimeGameService } from '@app/services/limited-time-game/limited-time-game.service';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Coordinate } from '@common/coordinates';
import { LobbyIO } from '@common/lobby-io';
import { Winner } from '@common/winner';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FirstGameMode, SecondGameMode } from './game-manager.service.constants';

@Injectable()
export class GameManagerService {
    private playingRooms: Map<string, string>;
    private waitingRooms: Map<string, Socket>;
    private games: GameMode[];
    private connectedSockets: Map<string, Socket>;
    private soloRoomCounter: number;
    private versusRoomCounter: number;
    private serverSocket: Server;

    constructor(private readonly databaseService: DatabaseService, private readonly cardService: CardService) {
        this.playingRooms = new Map();
        this.waitingRooms = new Map();
        this.games = new Array();
        this.connectedSockets = new Map();
        this.soloRoomCounter = 0;
        this.versusRoomCounter = 0;
    }

    set server(socket: Server) {
        this.serverSocket = socket;
    }

    async handleDisconnect(playerSocket: Socket) {
        const game = this.getGame(playerSocket);
        if (this.hasCreatedWaitingRoom(playerSocket.id)) {
            const data = JSON.stringify(this.getSocketFromId(playerSocket.id).data as LobbyIO);
            this.handleAbortedCreate(data);
        } else if (game && !game.isGameEnded()) {
            this.surrenderGame(playerSocket, game);
        }
        this.connectedSockets.delete(playerSocket.id);
    }

    async handleConnection(playerSocket: Socket): Promise<void> {
        this.connectedSockets.set(playerSocket.id, playerSocket);
        const cardIds = new Array();
        this.waitingRooms.forEach((_, key) => {
            cardIds.push(key);
        });
        playerSocket.emit('connection', JSON.stringify(cardIds));
        const cards = await this.cardService.getAllCards();
        this.cardService.updateClientLimitedModeEnable(cards.length);
    }

    handleMessageEvent(socket: Socket, socketData: string[]) {
        const room = this.playingRooms.get(socket.id);
        socket.to(room).emit('message', socketData);
    }

    async addPlayer(playerSocket: Socket, socketData: string): Promise<void> {
        playerSocket.data = JSON.parse(socketData) as LobbyIO;
        if (playerSocket.data.secondMode === SecondGameMode.SOLO) {
            const room = SecondGameMode.SOLO + String(this.soloRoomCounter++);
            this.playingRooms.set(playerSocket.id, room);
            playerSocket.join(room);
            await this.startGame(playerSocket);
        } else if (playerSocket.data.secondMode === SecondGameMode.VERSUS) {
            this.handleVersusMode(playerSocket);
        }
    }

    async getClue(playerSocket: Socket): Promise<void> {
        const game = this.getGame(playerSocket);
        const room = this.playingRooms.get(playerSocket.id);
        const clue = game.getClue();
        if (clue) {
            this.sendTo(room, 'clue', JSON.stringify(clue));
            this.sendTo(room, 'message', JSON.stringify({ message: 'Indice utilisé', type: ChatEntryType.EVENT } as ChatEntry));
        }
    }

    handleSurrender(playerSocket: Socket): void {
        const game = this.getGame(playerSocket);
        if (game) this.surrenderGame(playerSocket, game);
    }

    async handleClick(playerSocket: Socket, clickData: string): Promise<void> {
        const coord = JSON.parse(clickData) as Coordinate;
        const game = this.getGame(playerSocket);
        const room = this.playingRooms.get(playerSocket.id);
        const gameEnded = await game.handleClick(room, coord, playerSocket);
        if (gameEnded) this.games.splice(this.games.indexOf(game), 1);
    }

    handleAbortedCreate(socketData: string) {
        const data = JSON.parse(socketData) as LobbyIO;
        this.setWaitingRoom(data.cardId, undefined);
        this.updateCardStatus({ firstMode: data.firstMode, cardId: data.cardId }, 'createAborted');
    }

    joinWaitingRoom(socketData: string): void {
        const data = JSON.parse(socketData) as LobbyIO;
        const room = SecondGameMode.VERSUS + String(this.versusRoomCounter++);
        const firstPlayer = this.getWaitingRoomPlayer(data.cardId);
        const secondPlayer = this.getSocketFromId(data.secondPlayerId);
        this.setWaitingRoom(data.cardId, undefined);

        if (!firstPlayer && secondPlayer) {
            this.sendTo(secondPlayer.id, 'Creator disconnected');
            return;
        } else if (firstPlayer && !secondPlayer) {
            this.sendTo(firstPlayer.id, 'Joiner disconnected');
            return;
        }

        const firstPlayerName = firstPlayer.data.firstPlayerName;
        const firstPlayerId = firstPlayer.data.firstPlayerId;
        firstPlayer.data = data;
        secondPlayer.data = data;
        firstPlayer.join(room);
        secondPlayer.join(room);
        this.playingRooms.set(firstPlayer.id, room);
        this.playingRooms.set(secondPlayer.id, room);

        this.startGame(firstPlayer, secondPlayer);
        this.updateCardStatus(
            {
                firstMode: secondPlayer.data.firstMode,
                cardId: secondPlayer.data.cardId,
                firstPlayerName,
                firstPlayerId,
                secondPlayerName: secondPlayer.data.name,
                secondPlayerId: secondPlayer.id,
            },
            'joinRequestAccepted',
        );
    }

    handleAbortedRequest(socketData: string) {
        const data = JSON.parse(socketData) as LobbyIO;
        const waitingPlayer = this.getWaitingRoomPlayer(data.cardId);
        this.sendTo(
            waitingPlayer.id,
            'joinRequestAborted',
            JSON.stringify({ secondPlayerName: data.secondPlayerName, secondPlayerId: data.secondPlayerId }),
        );
    }

    handleRejectedRequest(socketData: string) {
        this.sendTo((JSON.parse(socketData) as LobbyIO).secondPlayerId, 'joinRequestRejected');
    }

    private handleVersusMode(newPlayer: Socket): void {
        const waitingPlayer = this.getWaitingRoomPlayer(newPlayer.data.cardId);
        if (!waitingPlayer) {
            this.createWaitingRoom(newPlayer);
        } else {
            this.askToJoin(waitingPlayer, newPlayer);
        }
    }

    private createWaitingRoom(firstPlayer: Socket): void {
        firstPlayer.data.firstPlayerId = firstPlayer.id;
        this.setWaitingRoom(firstPlayer.data.cardId, firstPlayer);
        this.updateCardStatus({ firstMode: firstPlayer.data.firstMode, cardId: firstPlayer.data.cardId }, 'created');
    }

    private askToJoin(firstPlayer: Socket, secondPlayer: Socket): void {
        secondPlayer.data.secondPlayerId = secondPlayer.id;
        this.sendTo(firstPlayer.id, 'joinRequest', JSON.stringify(secondPlayer.data));
    }

    private async startGame(firstPlayer: Socket, secondPlayer?: Socket): Promise<void> {
        const game = await this.createNewGameService(firstPlayer, secondPlayer);
        this.games.push(game);
        const room = this.playingRooms.get(firstPlayer.id);
        game.startTimer(room);
        await this.games[this.games.length - 1].start();
    }

    private getWaitingRoomPlayer(cardId: string): Socket {
        return this.waitingRooms.get(cardId);
    }

    private setWaitingRoom(cardId: string, waitingPlayer: Socket): void {
        if (waitingPlayer) {
            this.waitingRooms.set(cardId, waitingPlayer);
        } else {
            this.waitingRooms.delete(cardId);
        }
    }

    private getGame(socket: Socket): GameMode {
        return this.games.find((game) => {
            return game.firstPlayer.socket.id === socket.id || (game.secondPlayer && game.secondPlayer.socket.id === socket.id);
        });
    }

    private updateCardStatus(infos: LobbyIO, status: string) {
        this.broadcast(status, JSON.stringify(infos));
    }

    private getSocketFromId(socketId: string): Socket {
        return this.connectedSockets.get(socketId);
    }

    private hasCreatedWaitingRoom(playerSocketId: string): boolean {
        let playerIsWaiting = false;
        this.waitingRooms.forEach((player: Socket) => {
            if (player.id === playerSocketId) playerIsWaiting = true;
        });
        return playerIsWaiting;
    }

    private sendTo(receiver: string, message: string, args?: string): void {
        if (args) {
            this.serverSocket.to(receiver).emit(message, args);
        } else {
            this.serverSocket.to(receiver).emit(message);
        }
    }

    private broadcast(message: string, data: string): void {
        this.serverSocket.emit(message, data);
    }

    // Note: Trivial Method approved by Kamel on 03/14/2023 to prevent the constructor stub problem in tests
    private async createNewGameService(firstPlayer: Socket, secondPlayer: Socket): Promise<GameMode> {
        const players = new Array();
        const gameConstants = await this.cardService.getGameConstants();
        const firstPlayerInfo: PlayerData = {
            name: firstPlayer.data.firstPlayerName,
            foundDifferencesCount: 0,
            socket: firstPlayer,
            timerValue: 0,
            cardId: firstPlayer.data.cardId,
        };
        players.push(firstPlayerInfo);
        if (secondPlayer) {
            players.push({
                name: secondPlayer.data.secondPlayerName,
                foundDifferencesCount: 0,
                socket: secondPlayer,
                timerValue: 0,
                cardId: firstPlayer.data.cardId,
            } as PlayerData);
        }
        return firstPlayer.data.firstMode === FirstGameMode.CLASSIC
            ? new ClassicGameService(this.serverSocket, this.databaseService, this.cardService, players, gameConstants)
            : new LimitedTimeGameService(this.serverSocket, this.cardService, players, gameConstants, this.databaseService);
    }

    private surrenderGame(playerSocket: Socket, game: GameMode) {
        const room = this.playingRooms.get(playerSocket.id);
        const playerData = game.getPlayerData(playerSocket, false);
        const opponentData = game.getPlayerData(playerSocket, true);
        const opponentSocketId = opponentData ? opponentData.socket.id : ' ';
        const isClassical = game instanceof ClassicGameService;
        this.sendTo(room, 'message', JSON.stringify({ message: playerData.name + ' a abandonné la partie', type: ChatEntryType.EVENT } as ChatEntry));
        game.removePlayer(playerSocket);
        this.playingRooms.delete(playerSocket.id);
        playerSocket.leave(room);
        if (isClassical || !game.isStillPlaying()) {
            if (opponentData) playerSocket.to(room).emit('winner', JSON.stringify({ socketId: opponentData.socket.id } as Winner));
            game.stopTimer();
            const newGameHistory = game.addHistory(opponentSocketId, true, isClassical ? FirstGameMode.CLASSIC : FirstGameMode.LIMITED_TIME);
            this.games.splice(this.games.indexOf(game), 1);
            this.serverSocket.emit('historyChanged', JSON.stringify({ history: newGameHistory }));
        } else {
            if (!isClassical) game.setSurrenderSocketId(playerSocket.id);
            playerSocket.to(room).emit('playerQuit');
        }
    }
}
