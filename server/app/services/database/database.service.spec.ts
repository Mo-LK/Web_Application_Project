/* eslint-disable */
import { GameHistory, GameHistoryDocument } from '@app/model/database/game-history';
import { PlayerStats, StatDocument } from '@app/model/database/player-stats';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { DatabaseService } from './database.service';

function fakeFunc(): any {
    let ret: any;
    return ret;
}

describe('DatabaseService', () => {
    let service: DatabaseService;
    let mockModel: Model<StatDocument>;
    let mockModelHistory: Model<GameHistoryDocument>;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [DatabaseService, { provide: getModelToken(PlayerStats.name), useValue: Model,
            }, { provide: getModelToken(GameHistory.name), useValue: Model }],
        }).compile();
        service = module.get<DatabaseService>(DatabaseService);
        mockModel = module.get<Model<StatDocument>>(getModelToken(PlayerStats.name));
        mockModelHistory = module.get<Model<GameHistoryDocument>>(getModelToken(GameHistory.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findStats should call mongoose find with filter', async () => {
        const stats: PlayerStats[] = [];
        const filter = { cardId: 1 };
        jest.spyOn(mockModel, 'find').mockResolvedValue(stats);
        service.findStats(filter);
        expect(mockModel.find).toHaveBeenCalledWith(filter);
    });

    it('findStats should return [] if generate error', async () => {
        const stats: PlayerStats[] = [];
        const filter = { cardId: 1 };
        jest.spyOn(mockModel, 'find').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.findStats(filter);
        expect(res).toEqual([]);
    });

    it('createStats should call mongoose create with stat', async () => {
        const stat = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 100 };
        jest.spyOn(mockModel, 'create').mockImplementation(() => {});
        service.createStats(stat);
        expect(mockModel.create).toHaveBeenCalledWith(stat);
    });

    it('createStats should return {} if generate error', async () => {
        const stat = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 100 };
        jest.spyOn(mockModel, 'create').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.createStats(stat);
        expect(res).toEqual({});
    });

    it('remove should call mongoose deleteMany with filter', async () => {
        const filter = { cardId: 1 };
        jest.spyOn(mockModel, 'deleteMany').mockImplementation(fakeFunc);
        service.remove(filter);
        expect(mockModel.deleteMany).toHaveBeenCalledWith(filter);
    });

    it('remove should return undefined if deleteMany generate error', async () => {
        const filter = { gameType: "Classique" };
        jest.spyOn(mockModelHistory, 'deleteMany').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.remove(filter);
        expect(res).toBe(undefined);
    });

    it('findHistory should call mongoose find with filter', async () => {
        const history: GameHistory[] = [];
        const filter = { gameType: "Classique" };
        jest.spyOn(mockModelHistory, 'find').mockResolvedValue(history);
        service.findGameHistory(filter);
        expect(mockModelHistory.find).toHaveBeenCalledWith(filter);
    });

    it('findHistory should return [] if generate error', async () => {
        const history: GameHistory[] = [];
        const filter = { gameType: "Classique" };
        jest.spyOn(mockModelHistory, 'find').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.findGameHistory(filter);
        expect(res).toEqual([]);
    });

    it('createHistory should call mongoose create with history', async () => {
        const gameHistoryStub = {
            dateStarted: '2020-12-01',
            timeStarted: '12:00',
            timeLength: '00:30',
            gameType: 'Classique',
            firstPlayer: 'Player1',
            secondPlayer: 'Player2',
            winnerSocketId: '123',
            surrender: false,
            surrenderSocketId : ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        }
        jest.spyOn(mockModelHistory, 'create').mockImplementation(() => {});
        service.createHistory(gameHistoryStub);
        expect(mockModelHistory.create).toHaveBeenCalledWith(gameHistoryStub);
    });

    it('createHistory should return {} if error is generated', async () => {
        const gameHistoryStub = {
            dateStarted: '2020-12-01',
            timeStarted: '12:00',
            timeLength: '00:30',
            gameType: 'Classique',
            firstPlayer: 'Player1',
            secondPlayer: 'Player2',
            winnerSocketId: '123',
            surrender: false,
            surrenderSocketId : ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        }
        jest.spyOn(mockModelHistory, 'create').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.createHistory(gameHistoryStub);
        expect(res).toEqual({});
    });

    it('remove should call mongoose deleteMany with filter', async () => {
        const filter = { gameType: "Classique" };
        jest.spyOn(mockModelHistory, 'deleteMany').mockImplementation(fakeFunc);
        service.removeHistory(filter);
        expect(mockModelHistory.deleteMany).toHaveBeenCalledWith(filter);
    });

    it('remove should return undefined if deleteMany generate error', async () => {
        const filter = { gameType: "Classique" };
        jest.spyOn(mockModelHistory, 'deleteMany').mockImplementation(() => {
            throw new Error();
        });
        const res = await service.removeHistory(filter);
        expect(res).toBe(undefined);
    });
});
