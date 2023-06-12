/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { PopupMessageComponent } from '@app/components/popup-message/popup-message.component';
import { Game } from '@app/interfaces/game';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { LobbyIO } from '@common/lobby-io';
import { Socket } from 'socket.io-client';
import { FirstGameMode } from '../card-selection-change/card-selection-change.service.constants';
import { LobbyService } from './lobby.service';
import { Message } from './lobby.service.constants';

describe('LobbyService', () => {
    let service: LobbyService;
    let clientService: SocketClientService;
    let socket: any;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
            providers: [
                SocketClientService,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        service = TestBed.inject(LobbyService);
        const game: Game = {
            id: 'id',
            gameTitle: 'Titre',
            firstMode: 'Classique',
            secondMode: 'solo',
            difficulty: 'facile',
            differences: [],
        } as unknown as Game;
        service['gameService'].initializeSelf('Name');
        service['gameService'].loadGame(game);
        service['playerQueue'] = [{ cardId: '1' } as LobbyIO];
        service['clientService']['gameSocket']['id'] = 'idd';
        socket = {
            on: jasmine.createSpy(),
            emit: jasmine.createSpy(),
        };
        clientService = new SocketClientService();
        clientService['gameSocket'] = socket;
        spyOn(service['clientService'], 'connect').and.callFake(() => {
            service['clientService']['gameSocket'] = socketHelper as unknown as Socket;
        });
        spyOn(service['clientService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) => {
            socketHelper.on(event, callback);
        });
        service['handleSocket']();
        clientService.connect();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should push to playerQueue when joinRequest event is received', () => {
        service['gameService']['game'].firstMode = FirstGameMode.CLASSIC;
        service['playerQueue'] = [];
        const lobbyData = { cardId: '1' } as LobbyIO;
        socketHelper.peerSideEmit('joinRequest', JSON.stringify(lobbyData));
        expect(service['playerQueue']).toEqual([lobbyData]);
    });

    it('should push to waitingRoomCards when created event is received', () => {
        service['waitingRoomCards'] = [];
        const lobbyData = { cardId: '1' } as LobbyIO;
        socketHelper.peerSideEmit('created', JSON.stringify(lobbyData));
        expect(service['waitingRoomCards']).toEqual([lobbyData.cardId]);
    });

    it('should call handleAccept when joinRequestAccepted event is received', () => {
        const lobbyData = { cardId: '1' } as LobbyIO;
        spyOn<any>(service, 'handleAccept').and.callFake(() => {});
        socketHelper.peerSideEmit('joinRequestAccepted', JSON.stringify(lobbyData));
        expect(service['handleAccept']).toHaveBeenCalledWith(lobbyData);
    });

    it('should set isInLobby to false when joinRequestRejected event is received', () => {
        service.isInLobby = true;
        socketHelper.peerSideEmit('joinRequestRejected');
        expect(service.isInLobby).toEqual(false);
    });

    it('should call handleHostCancelGame when createAborted event is received', () => {
        const cardId = "1";
        spyOn<any>(service, 'handleHostCancelGame').and.callFake(() => {});
        socketHelper.peerSideEmit('createAborted', JSON.stringify({ cardId }));
        expect(service['handleHostCancelGame']).toHaveBeenCalledWith(cardId);
    });

    it('should call handlePlayerJoinAbort when joinRequestAborted event is received', () => {
        const lobbyData = { cardId: '1' } as LobbyIO;
        spyOn<any>(service, 'handlePlayerJoinAbort').and.callFake(() => {});
        socketHelper.peerSideEmit('joinRequestAborted', JSON.stringify(lobbyData));
        expect(service['handlePlayerJoinAbort']).toHaveBeenCalledWith(lobbyData);
    });

    it('should call handleNewConnection when connection event is received', () => {
        const card = ['id'];
        spyOn<any>(service, 'handleNewConnection').and.callFake(() => {});
        socketHelper.peerSideEmit('connection', JSON.stringify(card));
        expect(service['handleNewConnection']).toHaveBeenCalledWith(card);
    });

    it('should call handleCardDelete when cardDeleted event is received', () => {
        const cardId = '1';
        spyOn<any>(service, 'handleCardDelete').and.callFake(() => {});
        socketHelper.peerSideEmit('cardDeleted', cardId);
        expect(service['handleCardDelete']).toHaveBeenCalledWith(cardId);
    });

    it('acceptPlayer should call enterGame and send joinRequestAccepted event', () => {
        const lobby = { cardId: '1', firstPlayerId: 'idd', firstPlayerName: 'Name', secondPlayerName: 'hey' } as LobbyIO;
        spyOn(service['gameService'], 'enterGame').and.callFake(() => {});
        spyOn(service['clientService'], 'send').and.callFake(() => {});
        service['playerQueue'] = [lobby];
        service.acceptPlayer(0);
        expect(service['gameService'].enterGame).toHaveBeenCalled();
        expect(service['clientService'].send).toHaveBeenCalledWith('joinRequestAccepted', JSON.stringify(lobby));
    });

    it('denyPlayer send joinRequestRejected event', () => {
        spyOn(service['clientService'], 'send').and.callFake(() => {});
        service.denyPlayer(0);
        expect(service['clientService'].send).toHaveBeenCalledWith('joinRequestRejected', JSON.stringify({ cardId: '1' }));
    });

    it('discardCreatedGame send createAborted event', () => {
        spyOn(service['clientService'], 'send').and.callFake(() => {});
        service.discardCreatedGame();
        expect(service['clientService'].send).toHaveBeenCalledWith('createAborted', JSON.stringify({ cardId: 'id', firstMode: 'Classique' }));
    });

    it('enterLobby send addPlayer event with firstPlayerInfo if isCreationState and secondPlayer Info otherwise', () => {
        spyOn(service['clientService'], 'send').and.callFake(() => {});
        service['isGameCreator'] = true;
        service.enterLobby(true);
        expect(service['clientService'].send).toHaveBeenCalledWith(
            'addPlayer',
            JSON.stringify({ cardId: 'id', firstMode: 'Classique', secondMode: 'solo', firstPlayerName: 'Name' }),
        );
        service.enterLobby(false);
        service['waitingRoomCards'] = ['id'];
        expect(service['clientService'].send).toHaveBeenCalledWith(
            'addPlayer',
            JSON.stringify({ cardId: 'id', firstMode: 'Classique', secondMode: 'versus', firstPlayerName: 'Name' }),
        );
        service['isGameCreator'] = false;
        service.enterLobby(true);
        expect(service['clientService'].send).toHaveBeenCalledWith(
            'addPlayer',
            JSON.stringify({ cardId: 'id', firstMode: 'Classique', secondMode: 'solo', firstPlayerName: 'Name' }),
        );
        service['isGameCreator'] = false;
        service.enterLobby(false);
        expect(service['clientService'].send).toHaveBeenCalledWith(
            'addPlayer',
            JSON.stringify({ cardId: 'id', firstMode: 'Classique', secondMode: 'versus', secondPlayerName: 'Name' }),
        );
    });

    it('abandonWaitingRoom send joinRequestAborted event', () => {
        spyOn(service['clientService'], 'send').and.callFake(() => {});
        service.abandonWaitingRoom();
        expect(service['clientService'].send).toHaveBeenCalledWith(
            'joinRequestAborted',
            JSON.stringify({ cardId: 'id', firstMode: 'Classique', secondPlayerName: 'Name', secondPlayerId: 'idd' }),
        );
    });

    it('findPlayerIndex should return correct Index in playerQueue', () => {
        expect(service['findPlayerIndexInQueue']('1')).toEqual(-1);
    });

    it('handleNewConnection should call handleLobbyCreated for each cardId in array', () => {
        spyOn<any>(service, 'handleLobbyCreated').and.callFake(()=>{});
        service['handleNewConnection'](['1']);
        expect(service['handleLobbyCreated']).toHaveBeenCalledTimes(1);
        expect(service['handleLobbyCreated']).toHaveBeenCalledWith({ cardId: '1' });
    });

    it('handleAccept should call enterGame if socketId match and call handleGameDiscard', () => {
        spyOn(service['gameService'], 'enterGame').and.callFake(()=>{});
        spyOn<any>(service, 'handleGameDiscard').and.callFake(()=>{});
        service.isInLobby = true;
        service['handleAccept']({ cardId: 'dd', firstPlayerName: 'dd', secondPlayerId: 'idd' });
        expect(service['gameService'].enterGame).toHaveBeenCalled();
        expect(service['handleGameDiscard']).toHaveBeenCalled();
    });

    it('handleGameDiscard should set isInlobby false and remove id from waitingRoomArray', () => {
        service.isInLobby = true;
        service['lobbyId'] = '1';
        service.waitingRoomCards = ['1'];
        service['handleGameDiscard']('1');
        expect(service.waitingRoomCards).toEqual([]);
        expect(service.isInLobby).toEqual(false);
    });

    it('handleGameDiscard should not set isInlobby false if not in lobby', () => {
        service.isInLobby = true;
        service['lobbyId'] = '12';
        service.waitingRoomCards = ['1'];
        service['handleGameDiscard']('1');
        expect(service.waitingRoomCards).toEqual([]);
        expect(service.isInLobby).toEqual(true);
    });

    it('handleLobbyCreated should push card id into waitinglobby array', () => {
        service.waitingRoomCards = [];
        service['handleLobbyCreated']({ cardId: '1' });
        expect(service.waitingRoomCards).toEqual(['1']);
        expect(service.isInLobby).toEqual(false);
    });

    it('handlePlayerJoinAbort should remove player from queue', () => {
        service.playerQueue = [{ cardId: 'q' }];
        service['handlePlayerJoinAbort']({ cardId: 'q' });
        expect(service.playerQueue).toEqual([]);
    });

    it('deleteCard should send cardDeleted event', () => {
        spyOn(service['clientService'], 'send').and.callFake(()=>{});
        service.deleteCard('1');
        expect(service['clientService'].send).toHaveBeenCalledWith('cardDeleted', '1');
    });

    it('handleJoinRequest should push to playerQueue and call acceptPlayer if is limited mode', () => {
        const lobbyData = { firstMode: FirstGameMode.LIMITED_TIME } as LobbyIO;
        service['playerQueue'] = [];
        spyOn<any>(service, 'acceptPlayer').and.callFake(()=>{});
        service['handleJoinRequest'](lobbyData);
        expect(service['playerQueue']).toEqual([lobbyData]);
        expect(service.acceptPlayer).toHaveBeenCalled();
    });

    it('handleCardDelete should close lobby window and open notification pop-up', () => {
        service['waitingRoomCards'] = ['1'];
        service['isInLobby'] = true;
        service['lobbyId'] = 'fakeId';
        const closeAllStub = spyOn<any>(service.dialog, 'closeAll').and.callFake(()=>{});
        const openStub = spyOn<any>(service.dialog, 'open').and.callFake(()=>{});
        service['handleCardDelete']('fakeId');
        expect(service['waitingRoomCards']).toEqual([]);
        expect(service['isInLobby']).toEqual(false);
        expect(closeAllStub).toHaveBeenCalled();
        expect(openStub).toHaveBeenCalled();
    });

    it('handleHostCancelGame should remove card from waitingRoomCards and open PopupMessageComponent if in lobby', () => {
        service['waitingRoomCards'] = ['1'];
        service.isInLobby = true;
        service["lobbyId"] = '1';
        spyOn<any>(service['dialog'], 'open').and.callFake(()=>{});
        service['handleHostCancelGame']('1');
        expect(service['waitingRoomCards']).toEqual([]);
        expect(service['dialog'].open).toHaveBeenCalledWith(PopupMessageComponent, { data: { message: Message.HostLeft } });
    });
});
