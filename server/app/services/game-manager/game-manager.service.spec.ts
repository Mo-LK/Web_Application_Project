/* eslint-disable */
import { PlayerData } from '@app/model/interfaces/player-data';
import { CardService } from '@app/services/card/card.service';
import { ClassicGameService } from '@app/services/classic-game/classic-game.service';
import { DatabaseService } from '@app/services/database/database.service';
import { GameMode } from '@app/services/game/game.service.constants';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { LobbyIO } from '@common/lobby-io';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameManagerService } from './game-manager.service';
import { FirstGameMode, SecondGameMode } from './game-manager.service.constants';

describe('GameManagerService', () => {
    let service: GameManagerService;
    const room = 'room';
    let server: sinon.SinonStubbedInstance<Server>;
    let cardService: sinon.SinonStubbedInstance<CardService>;
    let databaseService: sinon.SinonStubbedInstance<DatabaseService>;
    let firstPlayerSocket: sinon.SinonStubbedInstance<Socket>;
    let secondPlayerSocket: sinon.SinonStubbedInstance<Socket>;
    let game: sinon.SinonStubbedInstance<GameMode>;
    let dataStub: LobbyIO;

    beforeEach(async () => {
        game = sinon.createStubInstance(ClassicGameService);
        databaseService = sinon.createStubInstance(DatabaseService);
        cardService = sinon.createStubInstance(CardService);
        firstPlayerSocket = sinon.createStubInstance<Socket>(Socket);
        secondPlayerSocket = sinon.createStubInstance<Socket>(Socket);
        server = sinon.createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [{
              provide: GameManagerService,
              useValue: new GameManagerService(databaseService, cardService),
          },],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
        service['serverSocket'] = server;

        dataStub = {
            cardId: '123456789123',
            firstMode: 'classique',
            secondMode: 'versus',
            firstPlayerName: 'Player 1',
            firstPlayerId: firstPlayerSocket.id,
            secondPlayerName: 'Player 2',
            secondPlayerId: secondPlayerSocket.id,
        };
        service['playingRooms'].set(firstPlayerSocket.id, room);
        service['playingRooms'].set(secondPlayerSocket.id, room);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('set server should set serverSocket', () => {
        service.server = "allo" as unknown as Server;
        expect(service['serverSocket']).toEqual("allo");
    });

    describe('handleDisconnect', () => {
        let getGameSpy: jest.SpyInstance;
        let hasCreatedWaitingRoomSpy: jest.SpyInstance;
        let handleAbortedCreateSpy: jest.SpyInstance;
        let surrenderGameSpy: jest.SpyInstance;

        beforeEach(() => {
            getGameSpy = jest.spyOn<GameManagerService, any>(service, 'getGame').mockImplementation(() => {
                return game;
            });
            hasCreatedWaitingRoomSpy = jest
                .spyOn<GameManagerService, any>(service, 'hasCreatedWaitingRoom')
                .mockImplementation(() => {
                    return true;
                });
            handleAbortedCreateSpy = jest
                .spyOn<GameManagerService, any>(service, 'handleAbortedCreate')
                .mockImplementation(() => {});
            surrenderGameSpy = jest.spyOn<GameManagerService, any>(service, 'surrenderGame').mockImplementation(() => {});
            jest.spyOn<GameManagerService, any>(service, 'getSocketFromId').mockImplementation(() => {
                return { data: dataStub };
            });
        });

        it('should notify the opponent that he is the winner if the player abandons', async () => {
            hasCreatedWaitingRoomSpy = jest
                .spyOn<GameManagerService, any>(service, 'hasCreatedWaitingRoom')
                .mockImplementation(() => {
                    return false;
                });
            game.isGameEnded.returns(false);
            await service['handleDisconnect'](firstPlayerSocket);
            expect(getGameSpy).toBeCalled();
            expect(surrenderGameSpy).toHaveBeenCalled();
        });

        it('should notify the players that the waiting room is no more if the player had created a waiting room', () => {
            getGameSpy = jest.spyOn<GameManagerService, any>(service, 'getGame').mockImplementation(() => {
                return true;
            });
            service['handleDisconnect'](firstPlayerSocket);
            expect(hasCreatedWaitingRoomSpy).toBeCalledWith(firstPlayerSocket.id);
            expect(handleAbortedCreateSpy).toBeCalled();
        });
    });

    describe('handleConnection', () => {
        it('should send the array of card where a player has created a waiting room', () => {
            const firstCardId = '123456789';
            jest.spyOn(cardService, 'getAllCards').mockResolvedValue([{} as Card]);
            const firstPlayerServerSocket = firstPlayerSocket;
            const secondCardId = '987654321';
            const secondPlayerServerSocket = secondPlayerSocket;
            const expectedCardIds = JSON.stringify([['123456789'], ['987654321']]);
            service['waitingRooms'] = new Map<string, Socket>();
            service['waitingRooms'].set(firstCardId, firstPlayerServerSocket);
            service['waitingRooms'].set(secondCardId, secondPlayerServerSocket);
            service['handleConnection'](firstPlayerSocket);
            expect(firstPlayerSocket.emit.calledWith('connection', expectedCardIds));
        });
    });

    describe('getClue', () => {
        it('should send clue event and message event only if game is solo and clue is truthy', () => {
            jest.spyOn<GameManagerService, any>(service, 'getGame').mockImplementation(() => {
                return game;
            });
            jest.spyOn<GameMode, any>(game, 'getClue').mockReturnValue([{} as Coordinate]);
            jest.spyOn<any, any>(service, 'sendTo').mockImplementation(() => {});
            const firstPlayerServerSocket = firstPlayerSocket;
            firstPlayerServerSocket.data = { secondMode: SecondGameMode.SOLO };
            service['getClue'](firstPlayerSocket);
            expect(service['sendTo']).toHaveBeenCalledTimes(2);
        });

        it('should not send clue event and message event if game is solo and clue is falsy', () => {
            jest.spyOn<any, any>(service, 'getGame').mockImplementation(() => {
                return game;
            });
            jest.spyOn<GameMode, any>(game, 'getClue').mockReturnValue(null);
            jest.spyOn<any, any>(service, 'sendTo').mockImplementation(() => {});
            const firstPlayerServerSocket = firstPlayerSocket;
            firstPlayerServerSocket.data = { secondMode: SecondGameMode.SOLO };
            service['getClue'](firstPlayerSocket);
            expect(service['sendTo']).toHaveBeenCalledTimes(0);
        });
    });

    describe('handleMessageEvent', () => {
        it('should send the message to the opponent', () => {
            const message = ['message', 'hello dear opponent'];
            firstPlayerSocket.to.returns({
                emit: (event: string, args: string) => {
                    expect(event).toEqual('message');
                    expect(args).toEqual(message);
                },
            } as BroadcastOperator<any, any>);
            service['handleMessageEvent'](firstPlayerSocket, message);
        });
    });

    describe('addPlayer', () => {
        let startGameSpy: jest.SpyInstance;
        let handleVersusModeSpy: jest.SpyInstance;

        beforeEach(() => {
            startGameSpy = jest.spyOn<any, any>(service, 'startGame').mockImplementation(() => {});
            handleVersusModeSpy = jest.spyOn<any, any>(service, 'handleVersusMode').mockImplementation(() => {});
        });

        it('should start a game directly if the second mode is solo', () => {
            dataStub.secondMode = 'solo';
            service['addPlayer'](firstPlayerSocket, JSON.stringify(dataStub));
            expect(startGameSpy).toBeCalledWith(firstPlayerSocket);
            expect(firstPlayerSocket.join.calledWith('solo0')).toBeTruthy();
        });

        it('should call handleVersusMode if the second mode is versus', () => {
            dataStub.secondMode = 'versus';
            service['addPlayer'](firstPlayerSocket, JSON.stringify(dataStub));
            expect(handleVersusModeSpy).toBeCalledWith(firstPlayerSocket);
            expect(firstPlayerSocket.join.called).not.toBeTruthy();
        });
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

            jest.spyOn<any, 'getGame'>(service, 'getGame').mockImplementation(() => {
                return game;
            });
            jest.spyOn<any, 'getPlayerData'>(game, 'getPlayerData').mockImplementation(() => {
                return { name: 'Name' };
            });
            jest.spyOn<any, 'saveWinner'>(game, 'saveWinner').mockResolvedValue(1);
            game['card'] = { title: 'ok' } as Card;
            sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
        });

        it('should remove game from games array if game is won', async () => {
            service['games'] = [game];
            game.handleClick.resolves(true);
            const coord = { x: 1, y: 1 };
            await service['handleClick'](firstPlayerSocket, JSON.stringify(coord));
            expect(game.handleClick.called).toBeTruthy();
            expect(service['games']).toEqual([]);
        });
    });

    describe('handleAbortedCreate', () => {
        let setWaitingRoomSpy: jest.SpyInstance;
        let updateCardStatusSpy: jest.SpyInstance;

        beforeEach(() => {
            setWaitingRoomSpy = jest.spyOn<any, 'setWaitingRoom'>(service, 'setWaitingRoom').mockImplementation(() => {});
            updateCardStatusSpy = jest.spyOn<any, 'updateCardStatus'>(service, 'updateCardStatus').mockImplementation(() => {});
        });

        it('should remove the waiting room and notify player of the abortion', () => {
            service['handleAbortedCreate'](JSON.stringify(dataStub));
            expect(setWaitingRoomSpy).toBeCalledWith(dataStub.cardId, undefined);
            expect(updateCardStatusSpy).toBeCalledWith({ firstMode: dataStub.firstMode, cardId: dataStub.cardId }, 'createAborted');
        });
    });

    describe('handleSurrender', () => {
        it('should call surrenderGame if game exists', () => {
            jest.spyOn<any, 'getGame'>(service, 'getGame').mockImplementation(() => {
                return game;
            });
            const surrenderGameSpy = jest.spyOn<any, 'surrenderGame'>(service, 'surrenderGame').mockImplementation(() => {});
            service['handleSurrender'](firstPlayerSocket);
            expect(surrenderGameSpy).toHaveBeenCalledWith(firstPlayerSocket, game);
        });
    });

    describe('joinWaitingRoom', () => {
        let setWaitingRoomSpy: jest.SpyInstance;
        let sendToSpy: jest.SpyInstance;
        let startGameSpy: jest.SpyInstance;
        let updateCardStatusSpy: jest.SpyInstance;

        beforeEach(() => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            jest.spyOn<any, 'getWaitingRoomPlayer'>(service, 'getWaitingRoomPlayer').mockImplementation(() => {
                return firstPlayerSocket;
            });
            jest.spyOn<any, 'getSocketFromId'>(service, 'getSocketFromId').mockImplementation(() => {
                return secondPlayerSocket;
            });
            setWaitingRoomSpy = jest.spyOn<any, 'setWaitingRoom'>(service, 'setWaitingRoom').mockImplementation(() => {});
            sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            startGameSpy = jest.spyOn<any, 'startGame'>(service, 'startGame').mockImplementation(() => {});
            updateCardStatusSpy = jest.spyOn<any, 'updateCardStatus'>(service, 'updateCardStatus').mockImplementation(() => {});
        });

        it('should start the game correctly if the players can be retreived', () => {
            const versusRoom = 'versus0';
            service['joinWaitingRoom'](JSON.stringify(dataStub));
            expect(firstPlayerSocket.join.calledWith(versusRoom)).toBeTruthy();
            expect(secondPlayerSocket.join.calledWith(versusRoom)).toBeTruthy();
            expect(startGameSpy).toBeCalledWith(firstPlayerSocket, secondPlayerSocket);
            expect(updateCardStatusSpy).toBeCalled();
        });

        it('should remove the waiting room', () => {
            service['joinWaitingRoom'](JSON.stringify(dataStub));
            expect(setWaitingRoomSpy).toBeCalledWith(dataStub.cardId, undefined);
        });

        it("should send 'Creator disconnected' if the first player cannot be retrieved", () => {
            jest.spyOn<any, 'getWaitingRoomPlayer'>(service, 'getWaitingRoomPlayer').mockImplementation(() => {
                return undefined;
            });
            service['joinWaitingRoom'](JSON.stringify(dataStub));
            expect(sendToSpy).toBeCalledWith(secondPlayerSocket.id, 'Creator disconnected');
        });

        it("should send 'Joiner disconnected' if the second player cannot be retrieved", () => {
            jest.spyOn<any, 'getSocketFromId'>(service, 'getSocketFromId').mockImplementation(() => {
                return undefined;
            });
            service['joinWaitingRoom'](JSON.stringify(dataStub));
            expect(sendToSpy).toBeCalledWith(firstPlayerSocket.id, 'Joiner disconnected');
        });
    });

    describe('handleAbortedRequest', () => {
        let sendToSpy: jest.SpyInstance;
        let getWaitingRoomPlayerSpy: jest.SpyInstance;

        beforeEach(() => {
            sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            getWaitingRoomPlayerSpy = jest
                .spyOn<any, 'getWaitingRoomPlayer'>(service, 'getWaitingRoomPlayer')
                .mockImplementation(() => {
                    return firstPlayerSocket;
                });
        });

        it("should send a 'joinRequestAborted' message with the correct info to the first player", () => {
            service['handleAbortedRequest'](JSON.stringify(dataStub));
            expect(getWaitingRoomPlayerSpy).toBeCalledWith(dataStub.cardId);
            const expectedDataSent = JSON.stringify({ secondPlayerName: dataStub.secondPlayerName, secondPlayerId: dataStub.secondPlayerId });
            expect(sendToSpy).toBeCalledWith(firstPlayerSocket.id, 'joinRequestAborted', expectedDataSent);
        });
    });

    describe('handleRejectedRequest', () => {
        let sendToSpy: jest.SpyInstance;

        beforeEach(() => {
            sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
        });

        it("should send a 'joinRequestRejected' message to the second player", () => {
            service['handleRejectedRequest'](JSON.stringify(dataStub));
            expect(sendToSpy).toBeCalledWith(dataStub.secondPlayerId, 'joinRequestRejected');
        });
    });

    describe('handleVersusMode', () => {
        let getWaitingRoomPlayerSpy: jest.SpyInstance;
        let createWaitingRoomSpy: jest.SpyInstance;
        let askToJoinSpy: jest.SpyInstance;

        beforeEach(() => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            getWaitingRoomPlayerSpy = jest
                .spyOn<any, 'getWaitingRoomPlayer'>(service, 'getWaitingRoomPlayer')
                .mockImplementation(() => {
                    return secondPlayerSocket;
                });
            createWaitingRoomSpy = jest.spyOn<any, 'createWaitingRoom'>(service, 'createWaitingRoom').mockImplementation(() => {});
            askToJoinSpy = jest.spyOn<any, 'askToJoin'>(service, 'askToJoin').mockImplementation(() => {});
        });

        it('should create a new waiting room if no one is already waiting', () => {
            getWaitingRoomPlayerSpy = jest
                .spyOn<any, 'getWaitingRoomPlayer'>(service, 'getWaitingRoomPlayer')
                .mockImplementation(() => {
                    return undefined;
                });
            service['handleVersusMode'](firstPlayerSocket);
            expect(getWaitingRoomPlayerSpy).toBeCalled();
            expect(createWaitingRoomSpy).toBeCalled();
        });

        it('should join a new waiting room if someone already waiting', () => {
            service['handleVersusMode'](firstPlayerSocket);
            expect(getWaitingRoomPlayerSpy).toBeCalled();
            expect(askToJoinSpy).toBeCalled();
        });
    });

    describe('createWaitingRoom', () => {
        let setWaitingRoomSpy: jest.SpyInstance;
        let updateCardStatusSpy: jest.SpyInstance;

        beforeEach(() => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            setWaitingRoomSpy = jest.spyOn<any, 'setWaitingRoom'>(service, 'setWaitingRoom').mockImplementation(() => {});
            updateCardStatusSpy = jest.spyOn<any, 'updateCardStatus'>(service, 'updateCardStatus').mockImplementation(() => {});
        });

        it('should create a waiting room and notify connected sockets about the creation', () => {
            service['createWaitingRoom'](firstPlayerSocket);
            expect(setWaitingRoomSpy).toBeCalledWith(dataStub.cardId, firstPlayerSocket);
            expect(updateCardStatusSpy).toBeCalledWith({ firstMode: dataStub.firstMode, cardId: dataStub.cardId }, 'created');
        });
    });

    describe('askToJoin', () => {
        let sendToSpy: jest.SpyInstance;

        beforeEach(() => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
        });

        it('should send a joinRequest to the creator', () => {
            service['askToJoin'](firstPlayerSocket, secondPlayerSocket);
            expect(sendToSpy).toBeCalledWith(firstPlayerSocket.id, 'joinRequest', JSON.stringify(dataStub));
        });
    });

    describe('startGame', () => {
        let createNewGameServiceSpy: jest.SpyInstance;

        beforeEach(() => {
            createNewGameServiceSpy = jest
                .spyOn<any, 'createNewGameService'>(service, 'createNewGameService')
                .mockImplementation(() => {
                    return game;
                });
        });

        it('should start a classical game if required', async () => {
            service['games'] = new Array();
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            await service['startGame'](firstPlayerSocket, secondPlayerSocket);
            expect(createNewGameServiceSpy).toHaveBeenCalledWith(firstPlayerSocket, secondPlayerSocket);
            expect(game.start.called).toBeTruthy();
        });

        it('should start a classical game in solo if only one player is given', async () => {
            service['games'] = new Array();
            firstPlayerSocket.data = dataStub;
            await service['startGame'](firstPlayerSocket);
            expect(createNewGameServiceSpy).toHaveBeenCalledWith(firstPlayerSocket, undefined);
            expect(game.start.called).toBeTruthy();
        });
    });

    describe('getWaitingRoomPlayer', () => {
        let getFirstModeIndexSpy: jest.SpyInstance;

        beforeEach(() => {
            service['waitingRooms'].set(dataStub.cardId, secondPlayerSocket);
        });

        it('should send a joinRequest to the creator', () => {
            const waitingRoomPlayer = service['getWaitingRoomPlayer'](dataStub.cardId);
            expect(waitingRoomPlayer).toEqual(secondPlayerSocket);
        });
    });

    describe('setWaitingRoom', () => {
        beforeEach(() => {
            service['waitingRooms'].set(dataStub.cardId, secondPlayerSocket);
        });

        it('should set the correct value to the given entry', () => {
            service['setWaitingRoom'](dataStub.cardId, firstPlayerSocket);
            expect(service['waitingRooms'].get(dataStub.cardId)).toEqual(firstPlayerSocket);
        });

        it('should delete the entry if the given player is undefined', () => {
            service['setWaitingRoom'](dataStub.cardId, undefined);
            expect(service['waitingRooms'].get(dataStub.cardId)).toBeUndefined();
        });
    });

    describe('getGame', () => {
        it('should return the socket game', () => {
            game['playerData'] = [{ socket: { id: '0' } as Socket } as PlayerData, { socket: secondPlayerSocket } as any as PlayerData];
            service['games'].push(game);
            const returnedGame = service['getGame'](secondPlayerSocket);
            expect(returnedGame).toEqual(game);
        });

        it('should return undefined if the given socket is not in a game', () => {
            const returnedGame = service['getGame'](firstPlayerSocket);
            expect(returnedGame).toBeUndefined();
        });
    });

    describe('updateCardStatus', () => {
        let broadcastSpy: jest.SpyInstance;

        beforeEach(() => {
            broadcastSpy = jest.spyOn<any, 'broadcast'>(service, 'broadcast').mockImplementation(() => {});
        });

        it('should broadcast the new card status', () => {
            const status = 'ok';
            const infos = dataStub;
            service['updateCardStatus'](infos, status);
            expect(broadcastSpy).toBeCalledWith(status, JSON.stringify(infos));
        });
    });

    describe('getSocketFromId', () => {
        it('should return the correct socket from a given id', () => {
            service['connectedSockets'].set(firstPlayerSocket.id, firstPlayerSocket);
            const returnedSocket = service['getSocketFromId'](firstPlayerSocket.id);
            expect(returnedSocket).toEqual(firstPlayerSocket);
        });
    });

    describe('hasCreatedWaitingRoom', () => {
        it('should return true if the player has created a waiting room', () => {
            const cardId = dataStub.cardId;
            service['waitingRooms'].set(cardId, firstPlayerSocket);
            const result = service['hasCreatedWaitingRoom'](firstPlayerSocket.id);
            expect(result).toEqual(true);
        });

        it('should return false if the player has not created a waiting room', () => {
            const result = service['hasCreatedWaitingRoom'](firstPlayerSocket.id);
            expect(result).toEqual(false);
        });
    });

    describe('sendTo', () => {
        let message: string;
        let data: string;

        beforeEach(() => {
            message = 'message';
            data = 'data';
        });

        it('should send the message with the data to the given receiver', () => {
            server.to.returns({
                emit: (event: string, args: string) => {
                    expect(event).toEqual(message);
                    expect(args).toEqual(data);
                },
            } as BroadcastOperator<any, any>);
            service['sendTo'](secondPlayerSocket.id, message, data);
        });

        it('should send the message with empty data if data is undefined', () => {
            server.to.returns({
                emit: (event: string, args: string) => {
                    expect(event).toEqual(message);
                    expect(args).toBeUndefined();
                },
            } as BroadcastOperator<any, any>);
            service['sendTo'](secondPlayerSocket.id, message);
        });
    });

    describe('broadcast', () => {
        it('should send the given message to every connected socket', () => {
            const message = 'broadcastedMessage';
            const data = 'broadcastedData';
            service['broadcast'](message, data);
            expect(server.emit.calledWith(message, data)).toBeTruthy();
        });
    });

    describe('createNewGameService', () => {
        it('should return a GameService', async () => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            expect(gameService).toBeInstanceOf(ClassicGameService);
        });
    });

    describe('surrenderGame', () => {
        it('surrenderGame should emit the corresponding messages and stop the timer', async () => {
            firstPlayerSocket.data = dataStub;
            firstPlayerSocket.data.firstMode = FirstGameMode.CLASSIC;
            secondPlayerSocket.data = dataStub;
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            const sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<any, any>;
            });
            const stopTimerSpy = jest.spyOn<any, 'stopTimer'>(gameService, 'stopTimer').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<any, any>;
            });
            service['surrenderGame'](firstPlayerSocket, gameService);
            expect(stopTimerSpy).toHaveBeenCalled();
            expect(sendToSpy).toHaveBeenCalled();
        });

        it('surrenderGame should emit the corresponding messages and stop the timer', async () => {
            firstPlayerSocket.data = dataStub;
            firstPlayerSocket.data.firstMode = FirstGameMode.LIMITED_TIME;
            secondPlayerSocket.data = dataStub;
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            const sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            jest.spyOn<any, 'isStillPlaying'>(gameService, 'isStillPlaying').mockReturnValueOnce(false);
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<any, any>;
            });
            const stopTimerSpy = jest.spyOn<any, 'stopTimer'>(gameService, 'stopTimer').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('winner');
                    },
                } as BroadcastOperator<any, any>;
            });
            service['surrenderGame'](firstPlayerSocket, gameService);
            expect(stopTimerSpy).toHaveBeenCalled();
            expect(sendToSpy).toHaveBeenCalled();
        });

        it('surrenderGame should emit playerQuit to room when is not classicMode', async () => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            firstPlayerSocket.data.firstMode = FirstGameMode.LIMITED_TIME;
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            const sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('playerQuit');
                    },
                } as BroadcastOperator<any, any>;
            });
            service['surrenderGame'](firstPlayerSocket, gameService);
        });

        it('surrenderGame should emit playerQuit to room when isStillPlaying return true', async () => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket.data = dataStub;
            firstPlayerSocket.data.firstMode = FirstGameMode.LIMITED_TIME;
            jest.spyOn<any, 'isStillPlaying'>(game, 'isStillPlaying').mockReturnValueOnce(true);
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {
                        expect(event).toEqual('playerQuit');
                    },
                } as BroadcastOperator<any, any>;
            });
            jest.spyOn<GameMode, 'getPlayerData'>(game, 'getPlayerData').mockReturnValue(undefined);
            service['surrenderGame'](firstPlayerSocket, gameService);
        });

        it('surrenderGame must return corresponding value with undefined secondPlayerSocket', async() => {
            firstPlayerSocket.data = dataStub;
            secondPlayerSocket = undefined;
            jest.spyOn<any, 'isStillPlaying'>(game, 'isStillPlaying').mockReturnValueOnce(true);
            const sendToSpy = jest.spyOn<any, 'sendTo'>(service, 'sendTo').mockImplementation(() => {});
            jest.spyOn(firstPlayerSocket, 'to').mockImplementation(() => {
                return {
                    emit: (event: string, args: string) => {},
                } as BroadcastOperator<any, any>;
            });
            const gameService = await service['createNewGameService'](firstPlayerSocket, secondPlayerSocket);
            const removePlayerSpy = jest.spyOn<GameMode, 'removePlayer'>(gameService, 'removePlayer').mockImplementation(() => {});
            service['surrenderGame'](firstPlayerSocket, gameService);
            expect(removePlayerSpy).toHaveBeenCalled();
        })
    });
});
