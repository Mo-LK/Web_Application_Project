/* eslint-disable */
import { DatabaseService } from '@app/services/database/database.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    const filter = { gameType: 'Classique' };
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
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    let historyService: HistoryService;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        historyService = new HistoryService(databaseServiceStub);
    });

    describe('removeHistory', () => {
        it('should call the database service removeHistory function', async () => {
            await historyService.removeHistory(filter);
            expect(databaseServiceStub.removeHistory.called).toBeTruthy();
        });
    });

    describe('getHistory', () => {
        it('should call the database service findGameHistory function', async () => {
            await historyService.getHistory(filter);
            expect(databaseServiceStub.findGameHistory.called).toBeTruthy();
        });
    });

    describe('createHistory', () => {
        it('should call the database service createHistory function', async () => {
            await historyService.createHistory(gameHistoryStub);
            expect(databaseServiceStub.createHistory.called).toBeTruthy();
        });
    });
});
