/* eslint-disable */
import { PlayerData } from '@app/model/interfaces/player-data';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { ChatEntry, ChatEntryType } from '@common/chatbox-message';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { CardService } from '../card/card.service';
import { DatabaseService } from '../database/database.service';
import { TIMER_INTERVAL } from '../game-manager/game-manager.service.constants';
import { StatsService } from '../stats/stats.service';
import { DEFAULT_WINNERS } from '../stats/stats.service.constants';
import { ClassicGameService } from './classic-game.service';

describe('TestService', () => {
    let service: ClassicGameService;
    let server: sinon.SinonStubbedInstance<Server>;
    let cardService: sinon.SinonStubbedInstance<CardService>;
    let databaseService: sinon.SinonStubbedInstance<DatabaseService>;
    let statsService: sinon.SinonStubbedInstance<StatsService>;
    let playerDataStub: PlayerData[];
    let firstPlayerSocket: sinon.SinonStubbedInstance<Socket>;
    let secondPlayerSocket: sinon.SinonStubbedInstance<Socket>;
    const room = 'room';
    let clock: sinon.SinonFakeTimers;

    beforeEach(async () => {
        server = sinon.createStubInstance<Server>(Server);
        databaseService = sinon.createStubInstance(DatabaseService);
        cardService = sinon.createStubInstance(CardService);
        statsService = sinon.createStubInstance(StatsService);
        firstPlayerSocket = sinon.createStubInstance<Socket>(Socket);
        secondPlayerSocket = sinon.createStubInstance<Socket>(Socket);
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
                {
                    provide: ClassicGameService,
                    useValue: new ClassicGameService(server, databaseService, cardService, playerDataStub, {} as GameConstants),
                },
                {
                    provide: StatsService,
                    useValue: statsService,
                },
            ],
        }).compile();

        service = module.get<ClassicGameService>(ClassicGameService);
        service['players'] = playerDataStub;
        service['differencesFound'] = [];
        service['card'] = {id: playerDataStub[0].cardId, stats: DEFAULT_WINNERS} as Card;
        service['gameTimer'] = { timer: null, counter: 0 };
        service['totalDifferenceCount'] = 0;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getTotalDifferenceCount should return totalDifferenceCount', () => {
        service['totalDifferenceCount'] = 4;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.getTotalDifferenceCount()).toEqual(4);
    });

    it('validateClick should return the coordinates if they have not been found yet', () => {
        const coords = [{
            x: 0,
            y: 0,
        }];
        const getDifferenceFromPixelSpy = jest
            .spyOn<CardService, 'getDifferenceFromPixel'>(cardService, 'getDifferenceFromPixel')
            .mockResolvedValue(coords);
        const isAlreadyFoundSpy = jest.spyOn<ClassicGameService, any>(service, 'isAlreadyFound').mockReturnValue(false);
        expect(service['validateClick'](coords[0])).toEqual(Promise.resolve(coords[0]));
    });

    it('validateClick should return null if coordinates have already been found', () => {
        const coords = {
            x: 0,
            y: 0,
        };
        const isAlreadyFoundSpy = jest.spyOn<ClassicGameService, any>(service, 'isAlreadyFound').mockReturnValue(true);
        expect(service['validateClick'](coords)).toEqual(Promise.resolve(null));
    });

    it('startTimer should start the timer', () => {
        const broadcastOperator = {
            emit: (event: string, args: string) => {
                expect(event).toEqual('clock');
            },
        };
        server.to.returns(broadcastOperator as BroadcastOperator<any, any>);
        const spyTo = jest.spyOn(server, 'to');
        const spyEmit = jest.spyOn(broadcastOperator, 'emit');
        clock = sinon.useFakeTimers();
        service.startTimer(room);
        clock.tick(TIMER_INTERVAL);
        expect(spyTo).toHaveBeenCalled();
        expect(spyEmit).toHaveBeenCalled();
        clock.restore();
    });

    it('stopTimer should call clearInterval', () => {
        const spyClearInterval = jest.spyOn(global, 'clearInterval');
        service.stopTimer();
        expect(spyClearInterval).toHaveBeenCalled();
    });  
    
    it('incrementPlayerDifferenceCount should increment the differences count of the corresponding player', () => {
        service.incrementPlayerDifferenceCount(firstPlayerSocket);
        expect(service.getPlayerData(firstPlayerSocket, false).foundDifferencesCount).toBe(1);
    });
        
    it('isGameEnded should return true if the game is ended, false otherwise', async () => {
        service['totalDifferenceCount'] = 2;
        service['players'][0].foundDifferencesCount = 1;
        const returnedIsGameEnded1 = await service.isGameEnded();
        expect(returnedIsGameEnded1).toEqual(true);
        service['players'][0].foundDifferencesCount = 0;
        const returnedIsGameEnded2 = await service.isGameEnded();
        expect(returnedIsGameEnded2).toEqual(false);
    });

    it('saveWinner should call addStat', async () => {
        const addStatSpy = jest.spyOn<StatsService, 'addStat'>(service['statService'], 'addStat')
        .mockResolvedValue(1);
        const socketWithDataStub = sinon.createStubInstance<Socket>(Socket);
        const socketData = {firstMode: 'classique', secondMode: 'solo'};
        socketWithDataStub.data = socketData;
        const getCardStatsSpy = jest.spyOn<StatsService, 'getCardStats'>(service['statService'], 'getCardStats').mockResolvedValue({} as CardStats);
        const getPlayerDataSpy = jest.spyOn<any, 'getPlayerData'>(service, 'getPlayerData')
        .mockImplementation(() => {
            return {
                name: 'nameValue',
                foundDifferencesCount: 0,
                socket: socketWithDataStub,
                timerValue: 0,
                cardId: 'cardIdValue',
            };
        });
        const position = await service.saveWinner(socketWithDataStub);
        expect(position).toEqual(1);
        expect(getCardStatsSpy).toHaveBeenCalled();
        expect(getPlayerDataSpy).toHaveBeenCalled();
        expect(addStatSpy).toHaveBeenCalled();
    });

    it('saveWinner should return null if saveWinner stats did not qualify for a position', async () => {
        const addStatSpy = jest.spyOn<StatsService, 'addStat'>(service['statService'], 'addStat')
        .mockResolvedValue(-1);
        const socketWithDataStub = sinon.createStubInstance<Socket>(Socket);
        const socketData = {firstMode: 'classique', secondMode: 'solo'};
        socketWithDataStub.data = socketData;
        const getCardStatsSpy = jest.spyOn<StatsService, 'getCardStats'>(service['statService'], 'getCardStats').mockResolvedValue({} as CardStats);
        const getPlayerDataSpy = jest.spyOn<any, 'getPlayerData'>(service, 'getPlayerData')
        .mockImplementation(() => {
            return {
                name: 'nameValue',
                foundDifferencesCount: 0,
                socket: socketWithDataStub,
                timerValue: 0,
                cardId: 'cardIdValue',
            };
        });
        const position = await service.saveWinner(socketWithDataStub);
        expect(position).toEqual(null);
        expect(getCardStatsSpy).toHaveBeenCalled();
        expect(getPlayerDataSpy).toHaveBeenCalled();
        expect(addStatSpy).toHaveBeenCalled();
    });

    it('start() should set class attribute correctly at the beginning of the game', () => {
        const getCardSpy = jest.spyOn<any, 'getCard'>(cardService, 'getCard')
        .mockImplementation(() => {
            return Promise.resolve({differences: []});
        });
        jest.spyOn(server, 'to').mockImplementation(() => {
            return {
                emit: (event: string, args: string) => {
                    expect(event).toEqual('constants');
                },
            } as BroadcastOperator<unknown, unknown>;
        });
        service.start();
        expect(service.getTotalDifferenceCount()).toEqual(0);
    });

    it('isAlreadyFound should return true if the difference is already found', () => {
        const isAlreadyFoundSpy = jest.spyOn<any, 'isAlreadyFound'>(service, 'isAlreadyFound');
        service['differencesFound'] = [[{x: 0, y: 0}]];
        const returnedVal = service['isAlreadyFound']([{x: 0, y: 0}]);
        expect(isAlreadyFoundSpy).toHaveBeenCalled();
        expect(returnedVal).toEqual(true);
    });

    it('getClue should call getClueDifference only if clueCounter is below 3', () => {
        const findSpy = jest.spyOn<any, 'getClueDifference'>(service, 'getClueDifference').mockImplementation(()=>{});
        jest.spyOn<any, 'getRemainingDifferences'>(service, 'getRemainingDifferences').mockImplementation(()=>{});
        service['clueCounter'] = 0;
        service['getClue']();
        service['clueCounter'] = 1;
        service['getClue']();
        service['clueCounter'] = 2;
        service['getClue']();
        service['clueCounter'] = 3;
        service['getClue']();
        expect(findSpy).toHaveBeenCalledTimes(3);
    });

    it('getRemainingDifferences should return all differences if isAlreadyFound returns false', () => {
        const findSpy = jest.spyOn<any, 'isAlreadyFound'>(service, 'isAlreadyFound').mockReturnValue(false);
        const differences = [[{} as Coordinate]];
        service['card'].differences = differences;
        service['getRemainingDifferences']();
        expect(service['card'].differences).toEqual(differences);
    });
    
    describe('handleClick', () => {
        let sendToSpy: jest.SpyInstance;

        beforeEach(() => {
            firstPlayerSocket.data = {
                cardId: '123456789',
                firstMode: 'solo',
                secondMode: 'classique',
                firstPlayerName: 'Bob',
                secondPlayerName: 'Roger',
                firstPlayerId: '123456789',
                secondPlayerId: '987654321',
            };
            jest.spyOn<any, 'getPlayerData'>(service, 'getPlayerData').mockImplementation(() => {
                return {name: 'Name'};
            });
            jest.spyOn<any, 'saveWinner'>(service, 'saveWinner').mockResolvedValue(1);
            service['card'] = {title: 'ok'} as Card;
        });

        it('should tell the winner that he won if the click is the final successful click', async () => {
            firstPlayerSocket.to.returns({
                emit: (event: string, args: string) => {
                    expect(event).toEqual('stopTimer');
                    expect(args).toEqual('0.5');
                },
            } as BroadcastOperator<unknown, unknown>);
            service['gameTimer'] = { counter: 1, timer: undefined };
            jest.spyOn<ClassicGameService, any>(service, 'validateClick').mockReturnValue([]);
            jest.spyOn<ClassicGameService, any>(service, 'isGameEnded').mockReturnValue(true);
            const coord = { x: 1, y: 1 };
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('success');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('message');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            await service['handleClick']('room', coord, firstPlayerSocket);
            expect(service['validateClick']).toHaveBeenCalledWith(coord);
        });

        it('should send a "success" event to the player if the click is successful, but not ending the game', async () => {
            const playerDataName = {name: 'Name'};
            firstPlayerSocket.data = playerDataName;
            jest.spyOn<any, 'validateClick'>(service, 'validateClick').mockImplementation(() => {
                return Promise.resolve([]);
            });
            jest.spyOn<any, 'isGameEnded'>(service, 'isGameEnded').mockReturnValue(false);
            const coord = { x: 1, y: 1 };
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('success');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('message');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            await service['handleClick']('room', coord, firstPlayerSocket);
        });

        it('should send a "winner" event to the player if the click is successful and the game is ended', async () => {
            const playerDataName = {name: 'Name'};
            firstPlayerSocket.data = playerDataName;
            jest.spyOn<any, 'validateClick'>(service, 'validateClick').mockImplementation(() => {
                return Promise.resolve([]);
            });
            jest.spyOn<any, 'isGameEnded'>(service, 'isGameEnded').mockImplementation(() => {
                return Promise.resolve(true);
            });
            const coord = { x: 1, y: 1 };
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('success');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('message');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            await service['handleClick']('room', coord, firstPlayerSocket);
        });

        it('should send an "error" event to the player if the click is unsuccessful', async () => {
            const playerDataName = {name: 'Name'};
            firstPlayerSocket.data = playerDataName;
            const emitSpy = jest.spyOn<any, 'emit'>(firstPlayerSocket, 'emit')
            .mockImplementation(() => {});
            jest.spyOn<any, 'validateClick'>(service, 'validateClick').mockImplementation(() => {
                return Promise.resolve(null);
            });
            jest.spyOn(firstPlayerSocket, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('error');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('message');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            const coord = { x: 1, y: 1 };
            const systemMessage = { message: 'Erreur par ' + firstPlayerSocket.data.name, type: ChatEntryType.EVENT } as ChatEntry;
            await service['handleClick']('room', coord, firstPlayerSocket);
            expect(emitSpy).toBeCalledWith('error', JSON.stringify(coord));
        });
    });
});
