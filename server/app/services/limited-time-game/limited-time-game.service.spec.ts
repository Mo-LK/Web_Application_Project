/* eslint-disable */
import { PlayerData } from '@app/model/interfaces/player-data';
import { Card } from '@common/card';
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { CardService } from '../card/card.service';
import { DatabaseService } from '../database/database.service';
import { TIMER_INTERVAL } from '../game-manager/game-manager.service.constants';
import { StatsService } from '../stats/stats.service';
import { LimitedTimeGameService } from './limited-time-game.service';

describe('LimitedTimeGameService', () => {
    let service: LimitedTimeGameService;
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
                    provide: LimitedTimeGameService,
                    useValue: new LimitedTimeGameService(server, cardService, playerDataStub, {initial: 1} as GameConstants, databaseService),
                },
            ],
        }).compile();

        service = module.get<LimitedTimeGameService>(LimitedTimeGameService);
        service['players'] = playerDataStub;
        const card = {} as Card;
        service['cards'] = [card];
        service['currentCardIndex'] = 0;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('currentCard should return currentCard', () => {
        const card = {} as Card;
        service['cards'] = [card];
        service['currentCardIndex'] = 0;
        expect(service.currentCard).toEqual(card);
    });

    it('start should call generateRandomCardsOrder and emit cardChange and constants', async () => {
        const card = {} as Card;
        service['cards'] = [card];
        service['currentCardIndex'] = 0;
        const randomOrderSpy = jest.spyOn<LimitedTimeGameService, any>(service, 'generateRandomCardsOrder').mockImplementation(()=>{});
        jest.spyOn(server, 'to').mockImplementationOnce(() => {
            return {
                emit: (event: string, args: string) => {
                    expect(event).toEqual('cardChange');
                },
            } as BroadcastOperator<unknown, unknown>;
        });
        jest.spyOn(server, 'to').mockImplementationOnce(() => {
            return {
                emit: (event: string, args: string) => {
                    expect(event).toEqual('constants');
                },
            } as BroadcastOperator<unknown, unknown>;
        });
        await service.start();
        expect(randomOrderSpy).toHaveBeenCalled();
    });

    it('getClue should call getClueDifference only if clueCounter is below 3 and set timeCounter to 0 if below', () => {
        const findSpy = jest.spyOn<any, 'getClueDifference'>(service, 'getClueDifference').mockImplementation(()=>{});
        service['gameTimer'] = { timer: null, counter: -1 };
        service['constants'].penalty = 0;
        service['clueCounter'] = 0;
        service['getClue']();
        service['clueCounter'] = 1;
        service['getClue']();
        service['clueCounter'] = 2;
        service['getClue']();
        service['clueCounter'] = 3;
        service['getClue']();
        expect(findSpy).toHaveBeenCalledTimes(3);
        expect(service['gameTimer']).toEqual({ timer: null, counter: 0 });
    });

    it('isGameEnded should return gameIsEnded', () => {
        service['gameIsEnded'] = true;
        expect(service.isGameEnded()).toEqual(true);
    });

    it('stopTimer should call clearInterval', () => {
        const spyClearInterval = jest.spyOn(global, 'clearInterval');
        service.stopTimer();
        expect(spyClearInterval).toHaveBeenCalled();
    }); 

    it('endGame should call stopTimer and emit endGame', () => {
        jest.spyOn(service, 'stopTimer').mockImplementation(()=>{});
        jest.spyOn(server, 'to').mockImplementationOnce(() => {
            return {
                emit: (event: string, args: string) => {
                    expect(event).toEqual('endGame');
                },
            } as BroadcastOperator<unknown, unknown>;
        });
        service['endGame'](true);
        expect(service.stopTimer).toHaveBeenCalled();
    }); 

    it('generateRandomCardsOrder should call getAllCards', () => {
        const cards = [{} as Card, {} as Card];
        const spyClearInterval = jest.spyOn(cardService, 'getAllCards').mockResolvedValue(cards);
        service['generateRandomCardsOrder']();
        expect(spyClearInterval).toHaveBeenCalled();
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

    it('startTimer should call endGame if counter === 0', () => {
        const broadcastOperator = {
            emit: (event: string, args: string) => {
                expect(event).toEqual('clock');
            },
        };
        service['constants'].initial = 0;
        const endGameSpy = jest.spyOn<LimitedTimeGameService, any>(service, 'endGame').mockImplementation(()=>{});
        server.to.returns(broadcastOperator as BroadcastOperator<any, any>);
        const spyTo = jest.spyOn(server, 'to');
        const spyEmit = jest.spyOn(broadcastOperator, 'emit');
        clock = sinon.useFakeTimers();
        service.startTimer(room);
        clock.tick(TIMER_INTERVAL);
        expect(spyTo).toHaveBeenCalled();
        expect(spyEmit).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
        clock.restore();
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
        });

        it('should call endGame if the click is the final successful click', async () => {
            jest.spyOn<CardService, 'getDifferenceFromPixel'>(cardService, 'getDifferenceFromPixel').mockResolvedValue([]);
            service['currentCardIndex'] = 0;
            service['cards'] = [{title: 'ok'} as Card];
            const coord = { x: 1, y: 1 };
            const endGameSpy = jest.spyOn<LimitedTimeGameService, any>(service, 'endGame').mockImplementation(()=>{});
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
            expect(endGameSpy).toHaveBeenCalled();
        });

        it('should send a "cardChange" event to the player if the click is successful, but not ending the game', async () => {
            jest.spyOn<CardService, 'getDifferenceFromPixel'>(cardService, 'getDifferenceFromPixel').mockResolvedValue([]);
            const playerDataName = {name: 'Name'};
            service['constants'].gain = 200;
            service['cards'] = [{title: 'ok'} as Card, {title: 'ok'} as Card];
            service['currentCardIndex'] = 0;
            firstPlayerSocket.data = playerDataName;
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
            jest.spyOn(server, 'to').mockImplementationOnce(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('cardChange');
                    },
                } as BroadcastOperator<unknown, unknown>;
            });
            await service['handleClick']('room', coord, firstPlayerSocket);
        });

        it('should send an "error" event to the player if the click is unsuccessful', async () => {
            const playerDataName = {name: 'Name'};
            firstPlayerSocket.data = playerDataName;
            jest.spyOn<CardService, 'getDifferenceFromPixel'>(cardService, 'getDifferenceFromPixel').mockResolvedValue(null);
            const emitSpy = jest.spyOn<any, 'emit'>(firstPlayerSocket, 'emit')
            .mockImplementation(() => {});
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
            await service['handleClick']('room', coord, firstPlayerSocket);
            expect(emitSpy).toBeCalledWith('error', JSON.stringify(coord));
        });
    });
});
