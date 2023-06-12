import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { ChatEntryType } from '@common/chatbox-message';
import { CHAT_LIMIT, MESSAGE_TYPE, POSITION_NOT_FOUND } from './chat-box.component.constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnChanges, OnDestroy {
    @ViewChild('messageInput') messageInput: ElementRef<HTMLInputElement>;
    @ViewChild('counter') counter: ElementRef<HTMLSpanElement>;
    @ViewChild('sendBtn') sendBtn: ElementRef<HTMLButtonElement>;
    @Input() deleteMessage: number;
    title: string;
    chatLimit: number;
    message: string;
    private messageSubscriber: Subscription;
    private enterKeyListenerRef: (this: Window, ev: KeyboardEvent) => unknown;
    private deleteMessageEqualiser: number;

    constructor(public messageService: MessageService, public gameService: GameService) {
        this.messageSubscriber = this.messageService.messageSubject.subscribe((data) =>
            this.generateMessage(data.message, MESSAGE_TYPE.get(data.type) as string, new Date().toLocaleTimeString()),
        );
        this.title = this.gameService.isMultiplayer ? 'Clavardage' : 'Évènements';
        this.chatLimit = CHAT_LIMIT;
        this.message = '';
        this.deleteMessageEqualiser = 0;
        this.messageService.clearMessages();
    }

    get chatEntryType(): typeof ChatEntryType {
        return ChatEntryType;
    }

    ngOnChanges(): void {
        if (this.deleteMessage + this.deleteMessageEqualiser) {
            this.deleteMessage++;
            this.messageService.clearMessages();
        }
    }

    ngOnDestroy(): void {
        this.messageSubscriber.unsubscribe();
    }

    send(): void {
        if (this.isMessageValid() && !this.gameService.getEndPopUpVisibility()) {
            this.messageService.sendMessage(this.message);
            this.generateMessage(this.message, 'self', new Date().toLocaleTimeString());
        }
    }

    adjustCounterAndSendBtn(): void {
        this.counter.nativeElement.style.color = this.isMessageLengthValid() ? 'black' : 'red';
        if (this.isMessageValid()) {
            this.sendBtn.nativeElement.disabled = false;
            this.sendBtn.nativeElement.className = 'send-btn';
        } else {
            this.sendBtn.nativeElement.disabled = true;
            this.sendBtn.nativeElement.className = 'send-btn disabled';
        }
    }

    isMessageLengthValid(): boolean {
        return this.message.length <= CHAT_LIMIT;
    }

    isMessageValid(): boolean {
        return this.isMessageLengthValid() && this.message.trim().length > 0;
    }

    generateMessage(message: string, type: string, timestamp: string): void {
        this.gameService.registerEvent({ this: this, method: this.generateMessage, params: [message, type, timestamp], timestamp: Date.now() });

        if (!this.gameService.isMultiplayer && type === 'system') {
            const stringIndex = message.indexOf(' par');
            if (stringIndex !== POSITION_NOT_FOUND) message = message.slice(0, stringIndex);
        }
        this.messageService.addMessage({ message, type: this.messageService.numberValueOfChatEntryType(type), timestamp });

        if (type === 'self') {
            this.message = '';
            this.adjustCounterAndSendBtn();
        }
    }

    inputSelected(): void {
        this.gameService.disableKeyListener();
        this.enterKeyListenerRef = this.sendWithEnter.bind(this);
        addEventListener('keydown', this.enterKeyListenerRef);
    }

    inputUnselected(): void {
        this.gameService.enableKeyListener();
        removeEventListener('keydown', this.enterKeyListenerRef);
    }

    sendWithEnter(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.send();
        }
    }
}
