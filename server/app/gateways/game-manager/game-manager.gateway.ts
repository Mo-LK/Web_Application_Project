import { NAMESPACE } from '@app/gateways/game-manager/game-manager.gateway.constants';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Injectable } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: NAMESPACE, cors: true })
@Injectable()
export class GameManagerGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private serverSocket: Server;

    constructor(private readonly gameManagerService: GameManagerService) {}

    @SubscribeMessage('disconnect')
    async handleDisconnect(playerSocket: Socket) {
        this.gameManagerService.handleDisconnect(playerSocket);
    }

    @SubscribeMessage('connection')
    async handleConnection(playerSocket: Socket): Promise<void> {
        this.gameManagerService.handleConnection(playerSocket);
    }

    @SubscribeMessage('message')
    private handleMessageEvent(@ConnectedSocket() socket: Socket, @MessageBody() socketData: string[]) {
        this.gameManagerService.handleMessageEvent(socket, socketData);
    }

    @SubscribeMessage('addPlayer')
    private async addPlayer(@ConnectedSocket() playerSocket: Socket, @MessageBody() socketData: string): Promise<void> {
        this.gameManagerService.addPlayer(playerSocket, socketData);
    }

    @SubscribeMessage('clue')
    private async getClue(@ConnectedSocket() playerSocket: Socket): Promise<void> {
        this.gameManagerService.getClue(playerSocket);
    }

    @SubscribeMessage('surrender')
    private handleSurrender(@ConnectedSocket() playerSocket: Socket): void {
        this.gameManagerService.handleSurrender(playerSocket);
    }

    @SubscribeMessage('handleClick')
    private async handleClick(@ConnectedSocket() playerSocket: Socket, @MessageBody() clickData: string): Promise<void> {
        this.gameManagerService.handleClick(playerSocket, clickData);
    }

    @SubscribeMessage('createAborted')
    private handleAbortedCreate(@MessageBody() socketData: string) {
        this.gameManagerService.handleAbortedCreate(socketData);
    }

    @SubscribeMessage('joinRequestAccepted')
    private joinWaitingRoom(@MessageBody() socketData: string): void {
        this.gameManagerService.joinWaitingRoom(socketData);
    }

    @SubscribeMessage('joinRequestAborted')
    private handleAbortedRequest(@MessageBody() socketData: string) {
        this.gameManagerService.handleAbortedRequest(socketData);
    }

    @SubscribeMessage('joinRequestRejected')
    private handleRejectedRequest(@MessageBody() socketData: string) {
        this.gameManagerService.handleRejectedRequest(socketData);
    }

    afterInit() {
        this.gameManagerService.server = this.serverSocket;
    }
}
