/* eslint-disable */
import { PlayerData } from '@app/model/interfaces/player-data';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { Server, Socket } from 'socket.io';
import { CardService } from '../card/card.service';
import { DatabaseService } from '../database/database.service';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let server: sinon.SinonStubbedInstance<Server>;
    let cardService: sinon.SinonStubbedInstance<CardService>;
    let playerDataStub: PlayerData[];
    let databaseService: sinon.SinonStubbedInstance<DatabaseService>;
    let firstPlayerSocket: sinon.SinonStubbedInstance<Socket>;
    let secondPlayerSocket: sinon.SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        databaseService = sinon.createStubInstance(DatabaseService);
        server = sinon.createStubInstance<Server>(Server);
        firstPlayerSocket = sinon.createStubInstance<Socket>(Socket);
        secondPlayerSocket = sinon.createStubInstance<Socket>(Socket);
        cardService = sinon.createStubInstance(CardService);
        playerDataStub = [
            {
                name: 'playerOne',
                foundDifferencesCount: 0,
                socket: firstPlayerSocket,
                timerValue: 0,
                cardId: 'cardIdValue',
            } as PlayerData,
            {
                name: 'playerTwo',
                foundDifferencesCount: 0,
                socket: secondPlayerSocket,
                timerValue: 0,
                cardId: 'cardIdValue',
            } as PlayerData,
        ];
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: GameService,
                    useValue: new GameService(server, cardService, playerDataStub, {} as GameConstants, databaseService),
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        service['players'] = playerDataStub;
        service['gameTimer'] = { timer: null, counter: 0 };
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getPlayerData should return the player data of the player with the given socket', () => {
        const getPlayerDataSpy = jest.spyOn<any, 'getPlayerData'>(service, 'getPlayerData');
        const playerOneGetOpponent = service['getPlayerData'](playerDataStub[0].socket, true);
        expect(getPlayerDataSpy).toHaveBeenCalled();
        expect(playerOneGetOpponent).toEqual(playerDataStub[1]);
        const playerTwoNotOpponent = service['getPlayerData'](playerDataStub[1].socket, false);
        expect(getPlayerDataSpy).toHaveBeenCalled();
        expect(playerTwoNotOpponent).toEqual(playerDataStub[1]);
    });

    it('getRandomDifference should return item at index pointed by random index found', () => {
        jest.spyOn<any, 'random'>(Math, 'random').mockReturnValue(0);
        const difference = [[{} as Coordinate]];
        expect(service['getRandomDifference'](difference)).toEqual(difference[0]);
    });

    it('getClueDifference should call getRandomDifference and increment clueCounter', () => {
        jest.spyOn<any, 'getRandomDifference'>(service, 'getRandomDifference').mockImplementation(()=>{});
        service['clueCounter'] = 2;
        service['getClueDifference']([[]]);
        expect(service['getRandomDifference']).toHaveBeenCalled();
        expect(service['clueCounter']).toEqual(3);
    });

    it('getFirstPlayer should return PlayerData of the first player', () => {
        const data = {} as PlayerData;
        service['playerData'] = [data];
        const returnedFirstPlayerSocket = service.firstPlayer;
        expect(returnedFirstPlayerSocket).toBe(data);
        service['playerData'] = [];
        const returnedFirstPlayerSocketNull = service.firstPlayer;
        expect(returnedFirstPlayerSocketNull).toEqual(undefined);
    });

    it('getSecondPlayer should return PlayerData of the second player', () => {
        const data = {} as PlayerData;
        service['playerData'] = [data, data];
        const returnedSecondPlayerSocket = service.secondPlayer;
        expect(returnedSecondPlayerSocket).toBe(data);
        service['playerData'] = [];
        const returnedSecondPlayerSocketNull = service.secondPlayer;
        expect(returnedSecondPlayerSocketNull).toEqual(undefined);
    });  

    it('isStillPlaying should return if there are still players playing', () => {
        service['playerData'] = [{} as PlayerData];
        expect(service.isStillPlaying()).toEqual(true);
        service['playerData'] = [];
        expect(service.isStillPlaying()).toEqual(false);
    });  

    it('removePlayer should remove the playerSocket from playerData array', () => {
        const first = {socket: '1'} as unknown as PlayerData;
        const second = {socket: '2'} as unknown as PlayerData;
        service['playerData'] = [first, second];
        service.removePlayer('1' as unknown as Socket);
        expect(service['playerData']).toEqual([second]);
        service['playerData'] = [first, second];
        service.removePlayer('2' as unknown as Socket);
        expect(service['playerData']).toEqual([first]);
    });  
});
