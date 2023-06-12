/* eslint-disable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Socket } from 'socket.io-client';

import { MessageService } from './message.service';

describe('MessageService', () => {
    let service: MessageService;
    let socketService: SocketClientService;
    let socketHelper: SocketTestHelper; 

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA], providers: [SocketClientService]});
        service = TestBed.inject(MessageService);
        socketService = TestBed.inject(SocketClientService);
        spyOn(service['socketService'], 'connect').and.callFake(() => {service['socketService']['gameSocket'] = socketHelper as unknown as Socket;});
        spyOn(service['socketService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) =>{
            socketHelper.on(event, callback);
        });
        service['handleSocket']();
        socketService.connect();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMessage should return the messages list', () => {
        const chatEntryStub = { message: 'test message', type: ChatEntryType.EVENT, timestamp: new Date().toLocaleTimeString() };
        service['messages'] = [chatEntryStub, chatEntryStub];
        const messages = service.getMessages();
        expect(messages).toEqual([chatEntryStub, chatEntryStub]);
    });

    it('addMessaage should add a message', () => {
        const chatEntryStub = { message: 'test message', type: ChatEntryType.EVENT, timestamp: new Date().toLocaleTimeString() };
        service.addMessage(chatEntryStub);
        expect(service['messages']).toEqual([chatEntryStub]);
    });

    it('clearMessages should clear messages', () => {
        service.clearMessages();
        expect(service['messages']).toEqual([]);
    });

    it('sendMessage should send message event with data', () => {
        const data = JSON.stringify({"message":"hey", "type":0});
        spyOn(service['socketService'], 'send').and.callFake(() => {});
        service.sendMessage('hey');
        expect(service['socketService'].send).toHaveBeenCalledWith('message', data);
    });

    it('should send messageSubject when message event is received', () => {
        const chatEntry = {message: 'ok', type: ChatEntryType.EVENT} as ChatEntry;
        spyOn<any>(service.messageSubject, "next").and.callFake(()=>{});
        socketHelper.peerSideEmit("message", JSON.stringify(chatEntry));
        expect(service.messageSubject.next).toHaveBeenCalledWith(chatEntry);
    });

    it('handleSocket should call addCallbackToMessage', () => {
        service['handleSocket']();
        expect(socketService.addCallbackToMessage).toHaveBeenCalled();
    });

    it('stringValueOfChatEntryType should return the correct string', () => {
        expect(service.stringValueOfChatEntryType(ChatEntryType.USER)).toEqual('user');
        expect(service.stringValueOfChatEntryType(ChatEntryType.SELF)).toEqual('self');
        expect(service.stringValueOfChatEntryType(ChatEntryType.EVENT)).toEqual('system');
        expect(service.stringValueOfChatEntryType(ChatEntryType.GLOBAL)).toEqual('global');
        expect(service.stringValueOfChatEntryType(ChatEntryType.OPPONENT)).toEqual('opponent');
    });

    it('numberValueOfChatEntryType should return the correct number', () => {
        expect(service.numberValueOfChatEntryType('user')).toEqual(ChatEntryType.USER);
        expect(service.numberValueOfChatEntryType('self')).toEqual(ChatEntryType.SELF);
        expect(service.numberValueOfChatEntryType('system')).toEqual(ChatEntryType.EVENT);
        expect(service.numberValueOfChatEntryType('global')).toEqual(ChatEntryType.GLOBAL);
        expect(service.numberValueOfChatEntryType('opponent')).toEqual(ChatEntryType.OPPONENT);
    });
});
