/* eslint-disable*/

import { CardService } from "@app/services/card/card.service";
import { DatabaseService } from "@app/services/database/database.service";
import { GameManagerService } from "@app/services/game-manager/game-manager.service";
import { Test, TestingModule } from "@nestjs/testing";
import * as sinon from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameManagerGateway } from "./game-manager.gateway";

describe('GameManagerGateway', () => {
    let gameManagerGateway: GameManagerGateway;
    let server: sinon.SinonStubbedInstance<Server>;
    let cardService: sinon.SinonStubbedInstance<CardService>;
    let databaseService: sinon.SinonStubbedInstance<DatabaseService>;
    let gameManagerService: GameManagerService;

    beforeEach(async () => {
        server = sinon.createStubInstance<Server>(Server);
        databaseService = sinon.createStubInstance(DatabaseService);
        cardService = sinon.createStubInstance(CardService);
        gameManagerService = new GameManagerService(databaseService, cardService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameManagerGateway,
                {
                    provide: GameManagerService,
                    useValue: gameManagerService,
                }
            ],
        }).compile();

        gameManagerGateway = module.get<GameManagerGateway>(GameManagerGateway);
        gameManagerGateway['serverSocket'] = server;
    });

    it('should be defined', () => {
        expect(gameManagerGateway).toBeDefined();
    });

    it('handleConnection should call gameManagerService.handleConnection', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleConnection').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleConnection']({} as Socket);
        expect(spy).toHaveBeenCalled();
    });

    it('handleDisconnect should call gameManagerService.handleDisconnect', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleDisconnect').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleDisconnect']({} as Socket);
        expect(spy).toHaveBeenCalled();
    });

    it('handleMessageEvent should call gameManagerService.handleMessageEvent', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleMessageEvent').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleMessageEvent']({} as Socket, {} as string[]);
        expect(spy).toHaveBeenCalled();
    });

    it('addPlayer should call gameManagerService.addPlayer', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'addPlayer').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['addPlayer']({} as Socket, {} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('getClue should call gameManagerService.getClue', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'getClue').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['getClue']({} as Socket);
        expect(spy).toHaveBeenCalled();
    });

    it('handleSurrender should call gameManagerService.handleSurrender', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleSurrender').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleSurrender']({} as Socket);
        expect(spy).toHaveBeenCalled();
    });

    it('handleClick should call gameManagerService.handleClick', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleClick').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleClick']({} as Socket, {} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('handleAbortedCreate should call gameManagerService.handleAbortedCreate', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleAbortedCreate').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleAbortedCreate']({} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('joinWaitingRoom should call gameManagerService.joinWaitingRoom', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'joinWaitingRoom').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['joinWaitingRoom']({} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('handleAbortedRequest should call gameManagerService.handleAbortedRequest', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleAbortedRequest').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleAbortedRequest']({} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('handleRejectedRequest should call gameManagerService.joinWaitingRoom', () => {
        const spy = jest.spyOn(gameManagerGateway['gameManagerService'], 'handleRejectedRequest').mockImplementation(()=> {return {} as any;});
        gameManagerGateway['handleRejectedRequest']({} as string);
        expect(spy).toHaveBeenCalled();
    });

    it('afterInit should set server', () => {
        gameManagerGateway['afterInit']();
        expect(gameManagerService['serverSocket']).toEqual(gameManagerGateway['serverSocket']);
    });
});
