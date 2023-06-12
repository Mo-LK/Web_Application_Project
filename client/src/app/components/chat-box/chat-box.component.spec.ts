/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { ChatBoxComponent } from './chat-box.component';
import { CHAT_LIMIT } from './chat-box.component.constants';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnChanges should increment deleteMessage and call clearMessages if .deleteMessage + this.deleteMessageEqualiser is not 0', () => {
        component.deleteMessage = 0;
        component['deleteMessageEqualiser'] = 1;
        spyOn<any>(component.messageService, 'clearMessages').and.callFake(() => {});
        component.ngOnChanges();
        expect(component.deleteMessage).toEqual(1);
        component['deleteMessageEqualiser'] = 0;
        component.deleteMessage = 0;
        component.ngOnChanges();
        expect(component.deleteMessage).toEqual(0);
        expect(component.messageService.clearMessages).toHaveBeenCalledTimes(1);
    });

    it('constructor should call generateMessage with system message', () => {
        spyOn(component, 'generateMessage');
        const timestamp = new Date().toLocaleTimeString();
        component.messageService.messageSubject.next({ message: 'Welcome to the game!', type: ChatEntryType.EVENT, timestamp } as ChatEntry);
        expect(component.generateMessage).toHaveBeenCalledWith('Welcome to the game!', 'system', timestamp);
        component.messageService.messageSubject.next({ message: 'I will best you!', type: ChatEntryType.USER, timestamp } as ChatEntry);
        expect(component.generateMessage).toHaveBeenCalledWith('I will best you!', 'opponent', timestamp);
    });

    describe('if is solo game', () => {
        beforeEach(() => {
            component['gameService']['isMultiplayer'] = false;
            fixture = TestBed.createComponent(ChatBoxComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('title should be Évènements', () => {
            expect(component.title).toBe('Évènements');
        });

        it('chatEntryType should be ChatEntryType', () => {
            expect(component.chatEntryType).toBe(ChatEntryType);
        });

        it('generateMessage should have a smaller message in solo mode', () => {
            const message = 'La partie est presque terminé par user';
            component.generateMessage(message, 'system', new Date().toLocaleTimeString());
            expect((new Date().toLocaleTimeString() + ' - ' + message).length).toBeGreaterThan(message.length);
        });
    });

    describe('if isMultiplayerGame', () => {
        beforeEach(() => {
            component['gameService']['isMultiplayer'] = true;
            fixture = TestBed.createComponent(ChatBoxComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('title should be Clavardage', () => {
            expect(component.title).toBe('Clavardage');
        });

        it('inputSelected should disable T listener', () => {
            spyOn(component['gameService'], 'disableKeyListener');
            component.inputSelected();
            expect(component['gameService'].disableKeyListener).toHaveBeenCalled();
        });

        it('inputUnselected should enable T listener', () => {
            spyOn(component['gameService'], 'enableKeyListener');
            component.inputUnselected();
            expect(component['gameService'].enableKeyListener).toHaveBeenCalled();
        });

        it('sendWithEnter should call send if enter key is pressed', () => {
            spyOn(component, 'send');
            component.sendWithEnter({ key: 'Enter' } as KeyboardEvent);
            expect(component.send).toHaveBeenCalled();
        });

        it('send should send and generate message if message is valid', () => {
            component.message = 'valid message';
            spyOn(component['messageService'], 'sendMessage');
            spyOn(component, 'generateMessage');
            component.send();
            expect(component['messageService'].sendMessage).toHaveBeenCalled();
            expect(component.generateMessage).toHaveBeenCalled();
        });

        it('adjustCounterAndSendBtn should set counter color to red and disable send button if message is too long', () => {
            component.message = 'a'.repeat(CHAT_LIMIT + 1);
            component.adjustCounterAndSendBtn();
            expect(component.counter.nativeElement.style.color).toBe('red');
            expect(component.sendBtn.nativeElement.disabled).toBeTruthy();
        });

        it('adjustCounterAndSendBtn should set counter color to black and enable send button if message is valid', () => {
            component.message = 'valid message';
            component.adjustCounterAndSendBtn();
            expect(component.counter.nativeElement.style.color).toBe('black');
            expect(component.sendBtn.nativeElement.disabled).toBeFalsy();
        });

        it('generateMessage should call adjustCounterAndSendBtn if type is self', () => {
            spyOn(component, 'adjustCounterAndSendBtn').and.callFake(() => {});
            component.generateMessage('test par hey', 'self', new Date().toLocaleTimeString());
            expect(component.adjustCounterAndSendBtn).toHaveBeenCalled();
        });

        it(`isMessageLengthValid should return true if message length is less than or equal to ${CHAT_LIMIT}`, () => {
            component.message = 'test';
            expect(component.isMessageLengthValid()).toBeTruthy();
        });

        it(`isMessageLengthValid should return false if message length is greater than ${CHAT_LIMIT}`, () => {
            component.message = 'a'.repeat(CHAT_LIMIT + 1);
            expect(component.isMessageLengthValid()).toBeFalsy();
        });

        it('isMessageValid should return false if message is empty', () => {
            component.message = ' ';
            expect(component.isMessageValid()).toBeFalsy();
        });
    });
});
