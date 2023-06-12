/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable */
import { PlayerStats } from '@app/model/database/player-stats';
import { DatabaseService } from '@app/services/database/database.service';
import { Card } from '@common/card';
import { CardStats, FirstModeStats } from '@common/card-stats';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { FirstGameMode } from '../game-manager/game-manager.service.constants';
import { StatsService } from './stats.service';
import { DEFAULT_WINNERS } from './stats.service.constants';

describe('CardService', () => {
    const UUID_STUB = '123456789';
    let statsService: StatsService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    let cardStub: Card;

    beforeEach(async () => {
        cardStub = new Card();
        databaseServiceStub = createStubInstance(DatabaseService);
        statsService = new StatsService(databaseServiceStub);
    });

    describe('remove', () => {
        it('should call the database service remove function', async () => {
            await statsService.remove({ cardId: UUID_STUB, firstMode: 'classique' });
            expect(databaseServiceStub.remove.called).toBeTruthy();
        });
    });

    describe('getCardStats', () => {
        let databaseServiceFindStatsSpy: jest.SpyInstance;
        beforeEach(() => {
            databaseServiceFindStatsSpy = jest.spyOn(databaseServiceStub, 'findStats').mockImplementation(async () => {
                return new Array();
            });
            jest.spyOn<any, 'formatPlayerStats'>(statsService, 'formatPlayerStats').mockImplementation(() => {});
        });

        it('should get stats from the database', async () => {
            await statsService.getCardStats(UUID_STUB);
            const expectedNumberOfTimesCalled = 2;
            expect(databaseServiceFindStatsSpy).toBeCalledTimes(expectedNumberOfTimesCalled);
        });
    });

    describe('saveStats', () => {
        let saveFirstModeStatsSpy: jest.SpyInstance;

        beforeEach(() => {
            cardStub.id = UUID_STUB;
            cardStub.stats = new CardStats();
            saveFirstModeStatsSpy = jest.spyOn<any, 'saveFirstModeStats'>(statsService, 'saveFirstModeStats').mockImplementation(async () => {});
        });

        it('should call saveFirstModeStats twice and with correct parameters', async () => {
            await statsService['saveStats'](cardStub);
            expect(saveFirstModeStatsSpy).toBeCalledWith(cardStub.id, cardStub.stats.classical, 'classique');
        });
    });

    describe('getDefaultStats', () => {
        it('should return the default stats', async () => {
            const stats = await statsService['getDefaultStats']();
            expect(stats).toEqual(DEFAULT_WINNERS);
            expect(stats).toBeInstanceOf(CardStats);
        });
    });

    describe('saveFirstModeStats', () => {
        let databaseServiceCreateStatsSpy: jest.SpyInstance;
        let firstModeStatsStub: FirstModeStats;
        const USERNAME_STUB = 'username';
        const SCORE_STUB = 100;

        beforeEach(() => {
            firstModeStatsStub = {
                solo: [
                    {
                        name: USERNAME_STUB,
                        score: SCORE_STUB,
                    },
                ],
                versus: [
                    {
                        name: USERNAME_STUB,
                        score: SCORE_STUB,
                    },
                ],
            };
            databaseServiceCreateStatsSpy = jest.spyOn(databaseServiceStub, 'createStats').mockImplementation(async () => {
                return new PlayerStats();
            });
        });

        it('should call database service methods to save the stats', async () => {
            const firstModeType = FirstGameMode.CLASSIC;
            const expectedFirstCallArgument = {
                cardId: UUID_STUB,
                firstMode: firstModeType,
                secondMode: 'solo',
                playerName: USERNAME_STUB,
                score: SCORE_STUB,
            };
            const expectedSecondCallArgument = {
                cardId: UUID_STUB,
                firstMode: firstModeType,
                secondMode: 'versus',
                playerName: USERNAME_STUB,
                score: SCORE_STUB,
            };
            await statsService['saveFirstModeStats'](UUID_STUB, firstModeStatsStub, firstModeType);
            expect(databaseServiceCreateStatsSpy).toHaveBeenNthCalledWith(1, expectedFirstCallArgument);
            expect(databaseServiceCreateStatsSpy).toHaveBeenNthCalledWith(2, expectedSecondCallArgument);
        });
    });

    describe('formatPlayerStats', () => {
        it('should sort the output in ascending order if first mode is classical', () => {
            const classicalSoloPlayerStatsStub = [
                {
                    cardId: UUID_STUB,
                    firstMode: 'classique',
                    secondMode: 'solo',
                    playerName: 'firstPlayerName',
                    score: 100,
                },
                {
                    cardId: UUID_STUB,
                    firstMode: 'classique',
                    secondMode: 'solo',
                    playerName: 'secondPlayerName',
                    score: 150,
                },
                {
                    cardId: UUID_STUB,
                    firstMode: 'classique',
                    secondMode: 'solo',
                    playerName: 'thirdPlayerName',
                    score: 200,
                },
            ];
            const expectedReturn = [
                { name: 'firstPlayerName', score: 100 },
                { name: 'secondPlayerName', score: 150 },
                { name: 'thirdPlayerName', score: 200 },
            ];
            const returnedStats = statsService['formatPlayerStats'](classicalSoloPlayerStatsStub, FirstGameMode.CLASSIC);
            expect(returnedStats).toEqual(expectedReturn);
        });

        it('should sort the output in descending order if first mode is limitedTime', () => {
            const classicalSoloPlayerStatsStub = [
                {
                    cardId: UUID_STUB,
                    firstMode: 'Temps limité',
                    secondMode: 'solo',
                    playerName: 'firstPlayerName',
                    score: 100,
                },
                {
                    cardId: UUID_STUB,
                    firstMode: 'Temps limité',
                    secondMode: 'solo',
                    playerName: 'secondPlayerName',
                    score: 150,
                },
                {
                    cardId: UUID_STUB,
                    firstMode: 'Temps limité',
                    secondMode: 'solo',
                    playerName: 'thirdPlayerName',
                    score: 200,
                },
            ];
            const expectedReturn = [
                { name: 'thirdPlayerName', score: 200 },
                { name: 'secondPlayerName', score: 150 },
                { name: 'firstPlayerName', score: 100 },
            ];
            const returnedStats = statsService['formatPlayerStats'](classicalSoloPlayerStatsStub, FirstGameMode.LIMITED_TIME);
            expect(returnedStats).toEqual(expectedReturn);
        });
    });

    it('addStat should add 3 stats if card stats are empty', async () => {
        const playerStat1: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 100 };
        const playerStat2: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 10 };
        const playerStat3: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 1 };
        const findSpy = jest.spyOn<any, 'findStats'>(databaseServiceStub, 'findStats')
        .mockImplementation(() => {
            return Promise.resolve([]);
        });
        const createStatsSpy = jest.spyOn<any, 'createStats'>(databaseServiceStub, 'createStats')
        .mockImplementation(() => {});
        const getCardStatsSpy = jest.spyOn<any, 'getCardStats'>(statsService, 'getCardStats')
        .mockImplementation(() => {});
        statsService['addStat'](playerStat1);
        expect(findSpy).toHaveBeenCalledWith({ cardId: playerStat1.cardId, firstMode: playerStat1.firstMode, secondMode: playerStat1.secondMode });
    });

    it('addStat add new stat and remove last stat if new stat is one of the better 3', async () => {
        const playerStat1: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 100 };
        const playerStat2: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 10 };
        const playerStat3: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Antoine', score: 1 };
        const findSpy = jest.spyOn<any, 'findStats'>(databaseServiceStub, 'findStats')
        .mockImplementation(() => {
            return Promise.resolve([playerStat1, playerStat2, playerStat3]);
        });
        jest.spyOn<any, 'sortStatArray'>(statsService, 'sortStatArray')
        .mockImplementation(() => {
            return [playerStat1, playerStat1, playerStat2, playerStat3];
        });
        const createStatsSpy = jest.spyOn<any, 'createStats'>(databaseServiceStub, 'createStats');
        await statsService['addStat'](playerStat1);
        expect(findSpy).toHaveBeenCalledWith({ cardId: playerStat1.cardId, firstMode: playerStat1.firstMode, secondMode: playerStat1.secondMode });
        expect(createStatsSpy).toHaveBeenCalledWith(playerStat1);
    });

    it('sortStatArray should sort Stat array in ascending order', async () => {
        const playerStat1: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Bob', score: 100 };
        const playerStat2: PlayerStats = { cardId: '1', firstMode: 'classique', secondMode: 'solo', playerName: 'Bob', score: 10 };
        const stats: PlayerStats[] = [playerStat1, playerStat2];
        const sortedArr = [playerStat2, playerStat1];
        const sortStatArraySpy = jest.spyOn<any, 'sortStatArray'>(statsService, 'sortStatArray');
        const returnedVal = statsService['sortStatArray'](stats);
        expect(sortStatArraySpy).toHaveBeenCalled();
        expect(returnedVal).toEqual(sortedArr);
    });
});
