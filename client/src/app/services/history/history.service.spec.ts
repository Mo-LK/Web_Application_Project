/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameHistory } from '@app/interfaces/history';
import { CommunicationService } from '@app/services/communication/communication.service';
import { HistoryService } from '@app/services/history/history.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('HistoryService', () => {
    let service: HistoryService;
    let socketHelper: SocketTestHelper;
    let socketService: SocketClientService;
    let httpService: CommunicationService;
    let fakeHistory: GameHistory;
    let fakeHistorySecond: GameHistory;
    let fakeHistoryThird: GameHistory;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(HistoryService);
        httpService = TestBed.inject(CommunicationService);
        socketService = TestBed.inject(SocketClientService);
        fakeHistory = {
            dateStarted: 'date',
            timeStarted: 'time',
            timeLength: 'length',
            gameType: 'Classique',
            firstPlayer: 'Didier',
            secondPlayer: 'Michel',
            winnerSocketId: '123',
            surrender: false,
            surrenderSocketId: ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        } as GameHistory;
        fakeHistorySecond = {
            dateStarted: 'date',
            timeStarted: 'time',
            timeLength: 'length',
            gameType: 'Classique',
            firstPlayer: 'Didier',
            secondPlayer: 'Michel',
            winnerSocketId: 'Didier',
            surrender: false,
            surrenderSocketId: ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        } as GameHistory;
        fakeHistoryThird = {
            dateStarted: 'date',
            timeStarted: 'time',
            timeLength: 'length',
            gameType: 'Classique',
            firstPlayer: 'Didier',
            secondPlayer: 'Michel',
            winnerSocketId: 'Didier',
            surrender: false,
            surrenderSocketId: ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        } as GameHistory;
        spyOn(service['socketService'], 'connect').and.callFake(() => {service['socketService']['gameSocket'] = socketHelper as unknown as Socket;});
        spyOn(service['socketService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) =>{
            socketHelper.on(event, callback);
        });
        service['handleSocket']();
        service['socketService'].connect();

    });

    it('deleteHistory should call delete request with correct route and empty service.history', async () => {
        const responseMessage = { title: 'title', body: 'test' };
        const spy = spyOn(httpService, 'deleteRequest').and.returnValue(of(responseMessage));
        await service.deleteHistory();
        expect(spy).toHaveBeenCalledWith('card/history');
        expect(service['history']).toEqual([]);
    });

    it('loadHistory should call get request with correct route and fill service.history', async () => {
        const responseMessage = { title: 'title', body: JSON.stringify(fakeHistory) };
        const spy = spyOn(httpService, 'getRequest').and.returnValue(of(responseMessage));
        await service['loadHistory']();
        expect(spy).toHaveBeenCalledWith('card/history');
        expect(service['history']).toEqual(JSON.parse(responseMessage.body));
    });

    it('handleHistoryChanged should shift gameHistory in service.history', () => {
        spyOn<any>(socketService, "send").and.callFake(()=>{});
        service['history'] = [fakeHistorySecond, fakeHistoryThird];
        const expectedArray = [fakeHistory, fakeHistorySecond, fakeHistoryThird];
        service['handleHistoryChanged'](fakeHistory);
        expect(service['history']).toEqual(expectedArray);
    });

    it('handleSocket should call socketService.addCallbackToMessage with correct parameters', () => {
        socketHelper.peerSideEmit("historyChanged", JSON.stringify(fakeHistory));
        socketHelper.peerSideEmit("resetHistory");
        expect(service['history']).toEqual([]);
    });
});
