/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardsManagerGateway } from '@app/gateways/cards-manager/cards-manager.gateway';
import { Images } from '@app/model/interfaces/images';
import { ConstantsService } from '@app/services/constants/constants.service';
import { DifferencesDetectionService } from '@app/services/differences-detection/differences-detection.service';
import { FileService } from '@app/services/file/file.service';
import { HistoryService } from '@app/services/history/history.service';
import { StatsService } from '@app/services/stats/stats.service';
import { DEFAULT_WINNERS } from '@app/services/stats/stats.service.constants';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import * as Jimp from 'jimp';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { CardService } from './card.service';
import { EMPTY_FILTER } from './card.service.constants';

export const TESTING_IMG_LOCATION = 'assets/img/tests/';

describe('CardService', () => {
    const UUID_STUB = '123456789';
    let cardService: CardService;
    let historyServiceStub: SinonStubbedInstance<HistoryService>;
    let statsServiceStub: SinonStubbedInstance<StatsService>;
    let differencesDetectionServiceStub: SinonStubbedInstance<DifferencesDetectionService>;
    let fileServiceStub: SinonStubbedInstance<FileService>;
    let cardManagerStub: SinonStubbedInstance<CardsManagerGateway>;
    let constantsServiceStub: SinonStubbedInstance<ConstantsService>;
    let cardStub: Card;

    beforeEach(async () => {
        cardStub = new Card();
        historyServiceStub = createStubInstance(HistoryService);
        statsServiceStub = createStubInstance(StatsService);
        cardManagerStub = createStubInstance(CardsManagerGateway);
        differencesDetectionServiceStub = createStubInstance(DifferencesDetectionService);
        constantsServiceStub = createStubInstance(ConstantsService);
        fileServiceStub = createStubInstance(FileService);

        cardService = new CardService(
            differencesDetectionServiceStub,
            statsServiceStub,
            fileServiceStub,
            cardManagerStub,
            historyServiceStub,
            constantsServiceStub,
        );
    });

    describe('saveCard', () => {
        let imagesStub: Images;
        let saveStatsSpy: jest.SpyInstance;
        let saveDifferencesSpy: jest.SpyInstance;
        let generateCardUUIDSpy: jest.SpyInstance;
        let fileServiceWriteSpy: jest.SpyInstance;
        let handleCreateCardSpy: jest.SpyInstance;
        beforeEach(() => {
            cardStub.stats = new CardStats();
            imagesStub = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
            generateCardUUIDSpy = jest.spyOn<any, 'generateCardUUID'>(cardService, 'generateCardUUID').mockImplementation((card: Card) => {
                card.id = UUID_STUB;
            });
            saveStatsSpy = jest.spyOn<any, 'saveStats'>(statsServiceStub, 'saveStats').mockImplementation(() => {});
            saveDifferencesSpy = jest.spyOn(fileServiceStub, 'saveDifferences').mockImplementation(async () => {});
            handleCreateCardSpy = jest.spyOn(cardManagerStub, 'handleCreatedCard').mockImplementation(() => {});
            jest.spyOn(fileServiceStub, 'getCardPath').mockImplementation(() => {
                return 'path/to/card';
            });
            jest.spyOn(statsServiceStub, 'getDefaultStats').mockImplementation(async () => {
                return new CardStats();
            });
            jest.spyOn(fileServiceStub, 'getCardPath').mockImplementation(() => {
                return 'path/to/card';
            });
            jest.spyOn(fileServiceStub, 'getImageLocation').mockImplementation((id: string, type: string) => {
                return 'path/to/' + id + '/' + type;
            });
            fileServiceWriteSpy = jest.spyOn(fileServiceStub, 'write').mockImplementation(async () => {});
        });

        it("should prevent from saving the card if the differences haven't been computed yet", async () => {
            const id = await cardService.saveCard(cardStub, imagesStub);
            expect(id).toBeUndefined();
            expect(saveStatsSpy).not.toBeCalled();
            expect(generateCardUUIDSpy).not.toBeCalled();
            expect(fileServiceWriteSpy).not.toBeCalled();
        });

        it('should write to the filesystem', async () => {
            const expectedCalledPathOriginal = 'path/to/' + UUID_STUB + '/' + 'original';
            const expectedCalledPathModified = 'path/to/' + UUID_STUB + '/' + 'modified';
            cardStub.differences = new Array();
            cardStub.differences.length = 10;
            await cardService.saveCard(cardStub, imagesStub);
            expect(saveStatsSpy).toHaveBeenCalledWith(cardStub);
            expect(saveDifferencesSpy).toHaveBeenCalledWith(cardStub.id, cardStub.differences);
            expect(handleCreateCardSpy).toHaveBeenCalledWith(cardStub);
            expect(fileServiceWriteSpy).toHaveBeenNthCalledWith(1, expectedCalledPathOriginal, imagesStub.originalImage);
            expect(fileServiceWriteSpy).toHaveBeenNthCalledWith(2, expectedCalledPathModified, imagesStub.modifiedImage);
            expect(fileServiceWriteSpy).toHaveBeenNthCalledWith(3, 'path/to/card', JSON.stringify(cardStub));
        });

        it("should generate a UUID if card doesn't have any yet", async () => {
            cardStub.differences = new Array();
            cardStub.differences.length = 10;
            await cardService.saveCard(cardStub, imagesStub);
            expect(generateCardUUIDSpy).toBeCalled();
            expect(cardStub.id).toEqual(UUID_STUB);
        });
    });

    describe('deleteCard', () => {
        let fileServiceRemoveSpy: jest.SpyInstance;
        let statsServiceRemoveSpy: jest.SpyInstance;

        beforeEach(() => {
            fileServiceRemoveSpy = jest.spyOn(fileServiceStub, 'remove').mockImplementation(async () => {});
            statsServiceRemoveSpy = jest.spyOn(statsServiceStub, 'remove').mockImplementation(async () => {});
            jest.spyOn(fileServiceStub, 'getCardPath').mockImplementation(() => {
                return 'path/to/card';
            });
            jest.spyOn(fileServiceStub, 'getDifferencesLocation').mockImplementation(() => {
                return 'path/to/differences';
            });
            jest.spyOn(fileServiceStub, 'getImageLocation').mockImplementation(() => {
                return 'path/to/image';
            });
            jest.spyOn(cardService, 'getAllCards').mockResolvedValue([{} as Card]);
        });

        it('should call remove methods', async () => {
            await cardService.deleteCard(UUID_STUB);
            expect(fileServiceRemoveSpy).toBeCalled();
            expect(statsServiceRemoveSpy).toBeCalled();
        });

        it('should return true if removal is successful', async () => {
            const result = await cardService.deleteCard(UUID_STUB);
            expect(result).toBe(true);
        });

        it('should return false if removal is not successful', async () => {
            jest.spyOn(fileServiceStub, 'remove').mockImplementation(async () => {
                throw new Error();
            });
            const result = await cardService.deleteCard(UUID_STUB);
            expect(result).toBe(false);
        });
    });

    describe('setStats', () => {
        beforeEach(() => {
            jest.spyOn(statsServiceStub, 'getDefaultStats').mockImplementation(async () => {
                return DEFAULT_WINNERS;
            });
            jest.spyOn(cardService, 'getCardMetadata').mockImplementation(async () => {
                return cardStub;
            });
        });

        it('should set card stats to default values if no stats is given', async () => {
            await cardService.setStats(UUID_STUB, undefined);
            expect(cardStub.stats).toEqual(DEFAULT_WINNERS);
        });

        it('should set card stats to default values if given stats dont include classical', async () => {
            const statsStub = new CardStats();
            await cardService.setStats(UUID_STUB, statsStub);
            expect(cardStub.stats).toEqual(DEFAULT_WINNERS);
        });

        it('should set card stats to given stats value', async () => {
            const statsStub = new CardStats();
            statsStub.classical = { solo: new Array(), versus: new Array() };
            await cardService.setStats(UUID_STUB, statsStub);
            expect(cardStub.stats).toEqual(statsStub);
        });
    });

    describe('getCard', () => {
        let getCardMetadataSpy: jest.SpyInstance;
        let getCardDifferencesSpy: jest.SpyInstance;
        const differenceStub = [
            [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
            [
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ],
        ];

        beforeEach(() => {
            getCardMetadataSpy = jest.spyOn(cardService, 'getCardMetadata').mockImplementation(async () => {
                return cardStub;
            });
            getCardDifferencesSpy = jest.spyOn(fileServiceStub, 'getCardDifferences').mockImplementation(async () => {
                return differenceStub;
            });
        });

        it('should get the card metadatas and datas', async () => {
            const card = await cardService.getCard(UUID_STUB);
            const expectedCard = cardStub;
            expectedCard.differences = differenceStub;
            expect(getCardMetadataSpy).toHaveBeenCalledWith(UUID_STUB);
            expect(getCardDifferencesSpy).toHaveBeenCalledWith(UUID_STUB);
            expect(card).toEqual(expectedCard);
        });
    });

    describe('getAllCards', () => {
        beforeEach(() => {
            jest.spyOn(fileServiceStub, 'getAllCardsFilenames').mockImplementation(async () => {
                return [UUID_STUB, UUID_STUB, UUID_STUB, UUID_STUB, UUID_STUB, UUID_STUB];
            });
            jest.spyOn(cardService, 'getCard').mockImplementation(async () => {
                return cardStub;
            });
            jest.spyOn<any, 'extractId'>(cardService, 'extractId').mockImplementation(() => {
                return UUID_STUB;
            });
        });

        it('should return an array of the correct length', async () => {
            const length = 6;
            const cards = await cardService['getAllCards']();
            expect(cards.length).toEqual(length);
        });

        it('should return an array of cards', async () => {
            const cards = await cardService['getAllCards']();
            cards.forEach((card) => {
                expect(card).toBeInstanceOf(Card);
            });
        });
    });

    describe('getCardMetadata', () => {
        beforeEach(() => {
            jest.spyOn(fileServiceStub, 'getCard').mockImplementation(async () => {
                return cardStub;
            });
            jest.spyOn(statsServiceStub, 'getCardStats').mockImplementation(async () => {
                return new CardStats();
            });
        });

        it('should return a card with stats set', async () => {
            cardStub.stats = new CardStats();
            const result = await cardService.getCardMetadata(UUID_STUB);
            expect(result).toEqual(cardStub);
            expect(result.stats).toBeDefined();
        });
    });

    describe('getDifferenceFromPixel', () => {
        let differenceStub: Coordinate[];

        beforeEach(() => {
            differenceStub = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
            ];
            const difference = new Array();
            difference[0] = differenceStub;
            jest.spyOn(fileServiceStub, 'getCardDifferences').mockImplementation(async () => {
                return difference;
            });
        });

        it('should return the complete difference', async () => {
            const difference = await cardService.getDifferenceFromPixel(UUID_STUB, { x: 0, y: 0 }, [differenceStub]);
            expect(difference).toEqual(differenceStub);
        });

        it('should return undefined if the given pixel is not in a difference', async () => {
            const difference = await cardService.getDifferenceFromPixel(UUID_STUB, { x: 100, y: 100 }, [differenceStub]);
            expect(difference).toBeUndefined();
        });
    });

    describe('computeCardDifferences', () => {
        let computeDifferencesStub: jest.SpyInstance;
        let imagesStub: Images;

        beforeEach(() => {
            imagesStub = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
            computeDifferencesStub = jest.spyOn(differencesDetectionServiceStub, 'computeDifferences').mockImplementation(async () => {
                return new Array();
            });
        });

        it('should call computeDifferences from the differences detection service', async () => {
            await cardService.computeCardDifferences(cardStub, imagesStub);
            expect(computeDifferencesStub).toBeCalledWith(cardStub, imagesStub);
        });

        it('should return the card', async () => {
            const result = await cardService.computeCardDifferences(cardStub, imagesStub);
            expect(result).toEqual(cardStub);
        });
    });

    describe('getDifferencesImage', () => {
        let generateDifferencesImageSpy: jest.SpyInstance;

        beforeEach(() => {
            generateDifferencesImageSpy = jest.spyOn(differencesDetectionServiceStub, 'generateDifferencesImage').mockImplementation(async () => {
                return Jimp.read(TESTING_IMG_LOCATION + 'image_empty.bmp');
            });
        });

        it('should return a buffer', async () => {
            const differenceImage = await cardService.getDifferencesImage(cardStub);
            expect(differenceImage).toBeInstanceOf(Buffer);
        });

        it('should call generateDifferencesImage from difference detection system', async () => {
            await cardService.getDifferencesImage(cardStub);
            expect(generateDifferencesImageSpy).toBeCalledWith(cardStub);
        });
    });

    describe('generateCardUUID', () => {
        beforeEach(() => {
            jest.spyOn(fileServiceStub, 'getCardPath').mockImplementation(() => {
                return '';
            });
        });

        it('should assign a unique UUID to the given card', async () => {
            jest.spyOn(Date, 'now').mockImplementation(() => {
                return Number(UUID_STUB);
            });
            let isFirstCall = true;
            jest.spyOn(fileServiceStub, 'fileExists').mockImplementation(async () => {
                if (isFirstCall) {
                    isFirstCall = false;
                    return true;
                }
                return false;
            });
            await cardService['generateCardUUID'](cardStub);
            expect(cardStub.id).toEqual(UUID_STUB);
        });
    });

    describe('resetAllStats', () => {
        it('should call getAllCards and call resetStat for each card in array', async () => {
            jest.spyOn(cardService, 'getAllCards').mockResolvedValue([{ id: 'id' } as Card]);
            jest.spyOn(cardService, 'resetStat').mockResolvedValue();
            await cardService.resetAllStats();
            expect(cardService.getAllCards).toHaveBeenCalled();
            expect(cardService.resetStat).toHaveBeenCalledTimes(1);
        });
    });

    describe('resetStat', () => {
        it('should call statsService.remove, statsService.saveStats and cardsManagerGateway.handleStatChanged', async () => {
            const card = { id: '1', stats: DEFAULT_WINNERS } as Card;
            jest.spyOn(statsServiceStub, 'remove').mockResolvedValue();
            jest.spyOn(statsServiceStub, 'saveStats').mockResolvedValue();
            jest.spyOn(cardManagerStub, 'handleStatChanged').mockImplementation(() => {});
            await cardService.resetStat(card.id);
            expect(statsServiceStub.remove).toHaveBeenCalledWith({ cardId: card.id });
            expect(statsServiceStub.saveStats).toHaveBeenCalledWith(card);
            expect(cardManagerStub.handleStatChanged).toHaveBeenCalledWith(card);
        });
    });

    describe('extractId', () => {
        it('should return the the ID without the extension from the filename', () => {
            const filename = UUID_STUB + '.json';
            const id = cardService['extractId'](filename);
            expect(id).toEqual(UUID_STUB);
        });
    });

    it('updateClientStats should call handleStatChanged', () => {
        const card = { id: '1', stats: DEFAULT_WINNERS } as Card;
        jest.spyOn(cardManagerStub, 'handleStatChanged').mockImplementation(() => {});
        cardService.updateClientStats(card);
        expect(cardManagerStub.handleStatChanged).toHaveBeenCalledWith(card);
    });

    it('setConstants should call setConstants, return its value and call handleConstantChanged if true', () => {
        const constants = {} as GameConstants;
        jest.spyOn(cardService['constantService'], 'setConstants').mockReturnValueOnce(true);
        jest.spyOn(cardService['cardsManagerGateway'], 'handleConstantChanged').mockImplementation(() => {});
        const returnValue1 = cardService.setConstants(constants);
        expect(returnValue1).toEqual(true);
        jest.spyOn(cardService['constantService'], 'setConstants').mockReturnValueOnce(false);
        const returnValue2 = cardService.setConstants(constants);
        expect(returnValue2).toEqual(false);
        expect(cardService['cardsManagerGateway'].handleConstantChanged).toHaveBeenCalledTimes(1);
    });

    it('getGameConstants should call fileService.getConstants() and return its value', async () => {
        const constants = { initial: 5 } as GameConstants;
        jest.spyOn(cardService['fileService'], 'getConstants').mockResolvedValue(constants);
        const result = await cardService.getGameConstants();
        expect(result).toEqual(constants);
        expect(cardService['fileService'].getConstants).toHaveBeenCalled();
    });

    it('updateClientLimitedModeEnable should call cardsManagerGateway.handleLimitedModeEnable', async () => {
        const handleLimitedModeSpy = jest.spyOn(cardService['cardsManagerGateway'], 'handleLimitedModeEnable').mockImplementation(() => {});
        cardService.updateClientLimitedModeEnable(1);
        expect(handleLimitedModeSpy).toHaveBeenCalled();
    });

    it('getAllHistory should call historyService.getHistory', async () => {
        await cardService.getAllHistory();
        expect(historyServiceStub.getHistory.called).toBeTruthy();
    });

    describe('resetHistory', () => {
        it('resetHistory should call historyService.removeHistory', async () => {
            await cardService.resetHistory();
            expect(historyServiceStub.removeHistory.called).toBeTruthy();
        });

        it('resetHistory should return false if it fails', async () => {
            historyServiceStub.removeHistory.throws();
            const result = await cardService.resetHistory();
            expect(result).toBeFalsy();
        });
    });

    describe('deleteAllCards', () => {
        beforeEach(async () => {
            cardStub.stats = new CardStats();
            jest.spyOn(cardService, 'getAllCards').mockImplementation(async () => {
                return [cardStub, cardStub] as Card[];
            });
        });
        it('deleteAllCards should call getAllCards, fileService.emptyFolder, statsService.remove and handleDeletedCard', async () => {
            jest.spyOn(fileServiceStub, 'emptyFolder').mockImplementation(async () => {
                return;
            });
            jest.spyOn(statsServiceStub, 'remove').mockImplementation(async () => {
                return;
            });
            jest.spyOn(cardManagerStub, 'handleDeletedCard').mockImplementation(() => {});
            await cardService.deleteAllCards();
            expect(cardService.getAllCards).toHaveBeenCalled();
            expect(fileServiceStub.emptyFolder).toHaveBeenCalledTimes(3);
            expect(statsServiceStub.remove).toHaveBeenCalledWith(EMPTY_FILTER);
            expect(cardManagerStub.handleDeletedCard).toHaveBeenCalledTimes(2);
            expect(cardManagerStub.handleDeletedCard).toHaveBeenCalledWith(cardStub.id, 0);
        });
        it('deleteAllCards should return false in case one of its called functions fails', async () => {
            jest.spyOn(cardService, 'getAllCards').mockImplementation(async () => {
                throw new Error();
            });
            const result = await cardService.deleteAllCards();
            expect(result).toBeFalsy();
        });
    });
});
