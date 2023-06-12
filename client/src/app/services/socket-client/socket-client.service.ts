import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    private gameSocket: Socket;
    private cardSocket: Socket;

    constructor() {
        this.connect();
    }

    get socketId() {
        return this.gameSocket.id;
    }

    connect() {
        this.gameSocket = io(`${environment.serverUrl}/game`, { transports: ['websocket'] });
        this.cardSocket = io(`${environment.serverUrl}/cards`, { transports: ['websocket'] });
        this.gameSocket.send('connection');
    }

    disconnect() {
        this.gameSocket.disconnect();
    }

    send<T>(event: string, data?: T): void {
        if (data) this.gameSocket.emit(event, data);
        else this.gameSocket.emit(event);
    }

    addCallbackToMessage(message: string, callback: (data: unknown) => void, isGameSocket: boolean = true) {
        if (isGameSocket) this.gameSocket.on(message, callback);
        else this.cardSocket.on(message, callback);
    }
}
