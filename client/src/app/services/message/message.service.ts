import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    messageSubject: Subject<ChatEntry>;
    private messages: ChatEntry[];

    constructor(private socketService: SocketClientService) {
        this.messageSubject = new Subject<ChatEntry>();
        this.handleSocket();
        this.messages = new Array();
    }

    getMessages(): ChatEntry[] {
        return this.messages;
    }

    addMessage(newMessage: ChatEntry): void {
        this.messages.unshift(newMessage);
    }

    clearMessages(): void {
        this.messages = [];
    }

    sendMessage(message: string) {
        const data = JSON.stringify({ message, type: ChatEntryType.USER });
        this.socketService.send('message', data);
    }

    stringValueOfChatEntryType(type: number): string {
        switch (type) {
            case ChatEntryType.USER:
                return 'user';
            case ChatEntryType.SELF:
                return 'self';
            case ChatEntryType.EVENT:
                return 'system';
            case ChatEntryType.GLOBAL:
                return 'global';
            default:
                return 'opponent';
        }
    }

    numberValueOfChatEntryType(type: string): number {
        switch (type) {
            case 'user':
                return ChatEntryType.USER;
            case 'self':
                return ChatEntryType.SELF;
            case 'system':
                return ChatEntryType.EVENT;
            case 'global':
                return ChatEntryType.GLOBAL;
            default:
                return ChatEntryType.OPPONENT;
        }
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage('message', (data) => {
            this.messageSubject.next(JSON.parse(data as string) as ChatEntry);
        });
    }
}
