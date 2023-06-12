/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { CardSelectionChangeService } from './card-selection-change.service';
import { FirstGameMode } from './card-selection-change.service.constants';

describe('CardSelectionChangeService', () => {
    let service: CardSelectionChangeService;
    let httpService: CommunicationService;
    let defaultCard: Card;
    let gameService: GameService;
    let socketHelper: SocketTestHelper;
    let socketService: SocketClientService;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, BrowserAnimationsModule],
            providers: [SocketClientService, CommunicationService, GameService],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(CardSelectionChangeService);
        httpService = TestBed.inject(CommunicationService);
        gameService = TestBed.inject(GameService);
        socketService = TestBed.inject(SocketClientService);
        defaultCard = {
            enlargementRadius: 13,
            differences: [],
            title: 'hey',
            stats: {} as unknown as CardStats,
            difficultyLevel: 'facile',
            id: 'de',
        };

        spyOn(service['clientService'], 'connect').and.callFake(() => {
            service['clientService']['gameSocket'] = socketHelper as unknown as Socket;
        });
        spyOn(service['clientService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) => {
            socketHelper.on(event, callback);
        });
        socketService.connect();
        service['handleSocket']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call handleCardDelete when cardDeleted event is received', () => {
        const cardId = 'hello';
        spyOn<any>(service, 'handleCardDelete').and.callFake(() => {});
        socketHelper.peerSideEmit('cardDeleted', cardId);
        expect(service['handleCardDelete']).toHaveBeenCalledWith(cardId);
    });

    it('should push to cardsData when cardCreated event is received', () => {
        const card = { cardId: 'hey' };
        service['cardsData'] = [];
        socketHelper.peerSideEmit('cardCreated', JSON.stringify(card));
        expect(service['cardsData']).toEqual([card as unknown as Card]);
    });

    it('should set isLimitedEnable when limitedModeEnable event is received', () => {
        service['isLimitedEnable'] = false;
        socketHelper.peerSideEmit('limitedModeEnable', JSON.stringify(true));
        expect(service['isLimitedEnable']).toEqual(true);
    });

    it('should call handleStatsChange when statsChanged event is received', () => {
        const card = { cardId: 'hey' };
        spyOn<any>(service, 'handleStatsChange').and.callFake(() => {});
        socketHelper.peerSideEmit('statsChanged', JSON.stringify(card));
        expect(service['handleStatsChange']).toHaveBeenCalledWith(card as unknown as Card);
    });

    it('should call handleCardDelete when cardDeleted event is received', () => {
        const cardId = 'hello';
        spyOn<any>(service, 'handleCardDelete').and.callFake(() => {});
        socketHelper.peerSideEmit('cardDeleted', cardId);
        expect(service['handleCardDelete']).toHaveBeenCalledWith(cardId);
    });

    it('cardStatsReset should call delete request with correct route', async () => {
        const id = 'id';
        const allCardsRoute = 'card/stats';
        const cardRoute = `card/stats/${id}`;
        const responseMessage: Observable<Message> = of({ title: 'title', body: 'test'});
        spyOn(httpService, 'deleteRequest').and.returnValue(responseMessage);
        await service.cardStatsReset();
        expect(httpService.deleteRequest).toHaveBeenCalledWith(allCardsRoute);
        await service.cardStatsReset(id);
        expect(httpService.deleteRequest).toHaveBeenCalledWith(cardRoute);
    });

    it('fetchCardsOnPage should return array of cards', async () => {
        const defaultCardArray: Card[] = new Array<Card>();
        for (let i = 0; i < 3; i++) {
            defaultCardArray.push(defaultCard as Card);
        }
        const response: Message = { title: 'title', body: JSON.stringify(defaultCardArray) };
        const responseMessage: Observable<Message> = of(response);
        spyOn(httpService, 'getRequest').and.returnValue(responseMessage);
        const arr = await service['fetchCards']();
        expect(arr).toEqual(defaultCardArray);
    });

    it('toggleButtons should set boolean value for button visibility at false and false if currentPage is 0 and nextPagedata is 0', async () => {
        service['currentPage'] = 0;
        spyOn(service, 'getPageData').and.returnValue([]);
        service['toggleButtons']();
        expect(service.nextPageButtonVisibility).toEqual(false);
        expect(service.previousPageButtonVisibility).toEqual(false);
    });

    it('toggleButtons should set boolean value for button visibility at true and true if currentPage is not 0 and nextPagedata is not 0', async () => {
        service['currentPage'] = 1;
        spyOn(service, 'getPageData').and.returnValue([{} as Card]);
        service['toggleButtons']();
        expect(service.nextPageButtonVisibility).toEqual(true);
        expect(service.previousPageButtonVisibility).toEqual(true);
    });

    it('changePage should call toggleButtons and getCurrentPage', async () => {
        service['currentPage'] = 0;
        spyOn<any>(service, 'toggleButtons').and.resolveTo();
        spyOn<any>(service, 'getPageData').and.callFake(() => {});
        await service['changePage'](false);
        expect(service['currentPage']).toEqual(0);
        await service['changePage'](true);
        expect(service['currentPage']).toEqual(1);
        await service['changePage'](false);
        expect(service['currentPage']).toEqual(0);
        expect(service['toggleButtons']).toHaveBeenCalledTimes(3);
    });

    it('loadGame call gameService.loadGame with Game', async () => {
        service['cardsData'] = [defaultCard];
        service['currentPage'] = 0;
        const gameSolo: Game = {
            id: defaultCard.id,
            gameTitle: defaultCard.title,
            firstMode: 'classique',
            secondMode: 'solo',
            difficulty: defaultCard.difficultyLevel,
            differences: [],
            differencesBackup: [],
        } as Game;
        const gameVersus: Game = {
            id: defaultCard.id,
            gameTitle: defaultCard.title,
            firstMode: 'classique',
            secondMode: 'solo',
            difficulty: defaultCard.difficultyLevel,
            differences: [],
            differencesBackup: [],
        } as Game;
        spyOn(gameService, 'loadGame').and.callFake(() => {});
        service.loadGame({ isSolo: true,  isClassic: true }, 0);
        expect(gameService.loadGame).toHaveBeenCalledWith(gameSolo);
        service.loadGame({ isSolo: false, isClassic: true }, 0);
        expect(gameService.loadGame).toHaveBeenCalledWith(gameVersus);
    });

    it('loadGame call gameService.loadGame with limited time id if is limited time mode', async () => {
        service['cardsData'] = [defaultCard];
        service['currentPage'] = 0;
        const limitedGame: Game = {
            id: FirstGameMode.LIMITED_TIME,
            gameTitle: FirstGameMode.LIMITED_TIME,
            firstMode: FirstGameMode.LIMITED_TIME,
            secondMode: 'solo',
            differences: [],
        } as unknown as Game;
        spyOn(gameService, 'loadGame').and.callFake(() => {});
        service.loadGame({ isSolo: true, isClassic: false });
        expect(gameService.loadGame).toHaveBeenCalledWith(limitedGame);
    });

    it('getCurrentPageData should return cards on page', async () => {
        service['cardsData'] = [defaultCard];
        service['currentPage'] = 0;
        expect(service.getPageData()).toEqual([defaultCard]);
    });

    it('currentPageIndex should make a delete request', async () => {
        const responseMessage: Observable<Message> = of({ body: 'OK', title: 'OK' });
        spyOn(httpService, 'deleteRequest').and.returnValue(responseMessage);
        await service.cardDeletion('1');
        expect(httpService.deleteRequest).toHaveBeenCalledWith('card/1');
    });

    it('handleStatsChange should change stats of corresponding card', async () => {
        service['cardsData'] = [{ cardId: '1', stats: 'allo' } as unknown as Card];
        service['handleStatsChange']({ cardId: '1', stats: 'ok' } as unknown as Card);
        expect(service['cardsData']).toEqual([{ cardId: '1', stats: 'ok' } as unknown as Card]);
    });

    it('handleCardDelete should remove card from array and call toggleButtons', async () => {
        spyOn<any>(service, 'toggleButtons').and.callFake(() => {});
        service['cardsData'] = [{ id: '1', stats: 'allo' } as unknown as Card];
        service['handleCardDelete'](service['cardsData'][0].id);
        expect(service['cardsData']).toEqual([]);
        expect(service['toggleButtons']).toHaveBeenCalled();
    });

    it('deleteAllCards should call delete request with correct route', async () => {
        service['cardsData'] = [{id: 'id'} as Card];
        const responseMessage: Observable<Message> = of({ title: 'title', body: 'test'});
        spyOn(httpService, 'deleteRequest').and.returnValue(responseMessage);
        await service.deleteAllCards();
        expect(httpService.deleteRequest).toHaveBeenCalledWith('card/');
    });
});
