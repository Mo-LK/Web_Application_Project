/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Images } from '@app/model/interfaces/images';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import * as Jimp from 'jimp';
import { DifferencesDetectionService } from './differences-detection.service';
import { BLACK, HEIGHT, WHITE, WIDTH } from './differences-detection.service.constants';

const TESTING_IMG_LOCATION = 'assets/img/tests/';
const EXPECTED_ENLARGMENT_RANGE_ADDED_PIXELS = [
    { x: 87, y: 144 },
    { x: 88, y: 146 },
    { x: 88, y: 145 },
    { x: 88, y: 144 },
    { x: 88, y: 143 },
    { x: 88, y: 142 },
    { x: 89, y: 146 },
    { x: 89, y: 145 },
    { x: 89, y: 144 },
    { x: 89, y: 143 },
    { x: 89, y: 142 },
    { x: 90, y: 143 },
    { x: 90, y: 142 },
    { x: 90, y: 141 },
    { x: 91, y: 143 },
    { x: 91, y: 142 },
    { x: 92, y: 143 },
    { x: 92, y: 142 },
];

const EXPECTED_ENLARGMENT_RANGE_PIXELS_TO_PROCESS = [
    { x: 90, y: 147 },
    { x: 90, y: 146 },
    { x: 90, y: 145 },
    { x: 91, y: 146 },
    { x: 91, y: 145 },
    { x: 91, y: 144 },
    { x: 92, y: 146 },
    { x: 92, y: 145 },
    { x: 92, y: 144 },
    { x: 93, y: 144 },
];

const ENLARGMENT_RANGE_STUB = [
    { x: -3, y: 0 },
    { x: -2, y: 2 },
    { x: -2, y: 1 },
    { x: -2, y: 0 },
    { x: -2, y: -1 },
    { x: -2, y: -2 },
    { x: -1, y: 2 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: -1, y: -2 },
    { x: 0, y: 3 },
    { x: 0, y: 2 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 0, y: -2 },
    { x: 0, y: -3 },
    { x: 1, y: 2 },
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 1, y: -2 },
    { x: 2, y: 2 },
    { x: 2, y: 1 },
    { x: 2, y: 0 },
    { x: 2, y: -1 },
    { x: 2, y: -2 },
    { x: 3, y: 0 },
];

describe('DifferencesDetectionService', () => {
    let differencesDetectionService: DifferencesDetectionService;
    let cardStub: Card;
    let differenceStub: Coordinate[];
    const originalImagePath = TESTING_IMG_LOCATION + 'image_empty.bmp';
    const modifiedImagePath = TESTING_IMG_LOCATION + 'image_2_diff.bmp';

    beforeEach(async () => {
        differenceStub = new Array();
        differenceStub = [
            { x: 30, y: 90 },
            { x: 30, y: 91 },
            { x: 30, y: 92 },
            { x: 30, y: 93 },
        ];

        cardStub = new Card();
        cardStub.enlargementRadius = 0;

        differencesDetectionService = new DifferencesDetectionService();
        differencesDetectionService['card'] = cardStub;
    });

    it('should be defined', () => {
        expect(differencesDetectionService).toBeDefined();
    });

    describe('computeDifferences', () => {
        let initializeArraysSpy: jest.SpyInstance;
        let precomputeEnlargmentRangeSpy: jest.SpyInstance;
        let findWholeDifferenceSpy: jest.SpyInstance;
        let imagesStub: Images;

        beforeEach(async () => {
            const originalImageStub = await (await Jimp.read(originalImagePath)).getBufferAsync(Jimp.MIME_BMP);
            const modifiedImageStub = await (await Jimp.read(modifiedImagePath)).getBufferAsync(Jimp.MIME_BMP);

            imagesStub = { originalImage: originalImageStub, modifiedImage: modifiedImageStub };

            initializeArraysSpy = jest
                .spyOn<any, 'initializeArrays'>(differencesDetectionService, 'initializeArrays')
                .mockImplementation(async () => {});
            precomputeEnlargmentRangeSpy = jest
                .spyOn<any, 'precomputeEnlargementRange'>(differencesDetectionService, 'precomputeEnlargementRange')
                .mockImplementation(async () => {});
            findWholeDifferenceSpy = jest
                .spyOn<any, 'findWholeDifference'>(differencesDetectionService, 'findWholeDifference')
                .mockImplementation(async () => {
                    return differenceStub;
                });
        });

        it('should return an array of differences', async () => {
            const differences = await differencesDetectionService.computeDifferences(cardStub, imagesStub);
            expect(differences).toBeInstanceOf(Array);
            differences.forEach((difference) => {
                expect(difference).toBeInstanceOf(Array);
            });
        });

        it("should set card's differences property value", async () => {
            await differencesDetectionService.computeDifferences(cardStub, imagesStub);
            expect(cardStub.differences).toBeInstanceOf(Array);
            cardStub.differences.forEach((difference) => {
                expect(difference).toBeInstanceOf(Array);
            });
        });

        it("should return undefined if original image isn't set", async () => {
            imagesStub.modifiedImage = undefined;
            const result = await differencesDetectionService.computeDifferences(cardStub, imagesStub);
            expect(result).toBeUndefined();
        });

        it("should return undefined if modified image isn't set", async () => {
            imagesStub.originalImage = undefined;
            const result = await differencesDetectionService.computeDifferences(cardStub, imagesStub);
            expect(result).toBeUndefined();
        });

        it("should return undefined if card hasn't set enlargment radius's value", async () => {
            const unsetCardStub = new Card();
            const result = await differencesDetectionService.computeDifferences(unsetCardStub, imagesStub);
            expect(result).toBeUndefined();
        });

        it('should call internal methods', async () => {
            await differencesDetectionService.computeDifferences(cardStub, imagesStub);
            expect(initializeArraysSpy).toHaveBeenCalled();
            expect(precomputeEnlargmentRangeSpy).toHaveBeenCalled();
            expect(findWholeDifferenceSpy).toHaveBeenCalled();
        });
    });

    describe('getDifficultyLevel', () => {
        let numberOfDifferences: number;
        let occupiedSpace: number;
        const highNumberOfDifferences = 8;
        const lowNumberOfDifferences = 3;
        const highOccupiedSpace = 0.2;
        const lowOccupiedSpace = 0.1;
        beforeEach(() => {
            jest.spyOn(differencesDetectionService, 'getNumberOfDifferences').mockImplementation(async () => {
                return numberOfDifferences;
            });
            jest.spyOn<any, 'getDifferencesOccupiedSpace'>(differencesDetectionService, 'getDifferencesOccupiedSpace').mockImplementation(() => {
                return occupiedSpace;
            });
        });

        it('should return difficile if card has less than 15% coverage of differences and more than 7 differences', async () => {
            numberOfDifferences = highNumberOfDifferences;
            occupiedSpace = lowOccupiedSpace;

            expect(await differencesDetectionService.getDifficultyLevel(cardStub)).toEqual('difficile');
        });

        it('should return facile if card has less than 15% coverage of differences, but also less than 7 differences', async () => {
            numberOfDifferences = lowNumberOfDifferences;
            occupiedSpace = lowOccupiedSpace;

            expect(await differencesDetectionService.getDifficultyLevel(cardStub)).toEqual('facile');
        });

        it('should return facile if card has more than 15% coverage of differences, but also more than 7 differences', async () => {
            numberOfDifferences = highNumberOfDifferences;
            occupiedSpace = highOccupiedSpace;

            expect(await differencesDetectionService.getDifficultyLevel(cardStub)).toEqual('facile');
        });

        it('should return facile if card has more than 15% coverage of differences and less than 7 differences', async () => {
            numberOfDifferences = lowNumberOfDifferences;
            occupiedSpace = highOccupiedSpace;

            expect(await differencesDetectionService.getDifficultyLevel(cardStub)).toEqual('facile');
        });
    });

    describe('generateDifferencesImage', () => {
        it('should color differences in black', async () => {
            cardStub.differences = new Array();
            cardStub.differences.push([{ x: 0, y: 0 }]);

            const differenceImage = differencesDetectionService.generateDifferencesImage(cardStub);
            expect((await differenceImage).getPixelColor(0, 0)).toEqual(BLACK);
        });

        it('should color non-differences in white', async () => {
            cardStub.differences = new Array();
            cardStub.differences.push([
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
            ]);

            const differenceImage = differencesDetectionService.generateDifferencesImage(cardStub);
            expect((await differenceImage).getPixelColor(0, 0)).toEqual(WHITE);
        });

        it("should return a white image if the image differences haven't been computed yet", async () => {
            const differenceImage = differencesDetectionService.generateDifferencesImage(cardStub);
            expect((await differenceImage).getPixelColor(0, 0)).toEqual(WHITE);
        });
    });

    describe('getNumberOfDifferences', () => {
        it('getNumberOfDifferences should correctly return number of differences', async () => {
            const numberOfDifferences = 2;
            cardStub.differences = new Array(numberOfDifferences);
            cardStub.differences[0] = new Array();
            cardStub.differences[1] = new Array();
            expect(await differencesDetectionService.getNumberOfDifferences(cardStub)).toEqual(numberOfDifferences);
        });
    });

    describe('findWholeDifference', () => {
        beforeEach(() => {
            const firstPixelOfFirstDifference = { x: 0, y: 0 };
            differencesDetectionService['pixelsToProcess'] = [firstPixelOfFirstDifference];
        });

        it('should find the complete difference from a single pixel', async () => {
            const numberOfDifferences = 3;
            jest.spyOn<any, 'canSkipEnlargmentRangeTraversal'>(differencesDetectionService, 'canSkipEnlargmentRangeTraversal').mockImplementation(
                async () => {
                    return true;
                },
            );
            let numberOfTimesCalled = 0;
            jest.spyOn<any, 'traverseSurroundingPixels'>(differencesDetectionService, 'traverseSurroundingPixels').mockImplementation(async () => {
                if (numberOfTimesCalled < numberOfDifferences) {
                    differencesDetectionService['pixelsToProcess'].push({ x: ++numberOfTimesCalled, y: 0 });
                }
            });
            const difference = await differencesDetectionService['findWholeDifference']();
            const expectedResult = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
            ];
            expect(difference).toEqual(expectedResult);
        });

        it("should call traverseEnlargmentRange and traverseSurroundingPixels if traversal can't be skipped", async () => {
            const canSkipEnlargmentRangeTraversalSpy = jest
                .spyOn<any, 'canSkipEnlargmentRangeTraversal'>(differencesDetectionService, 'canSkipEnlargmentRangeTraversal')
                .mockImplementation(async () => {
                    return false;
                });
            const traverseEnlargmentRangeSpy = jest
                .spyOn<any, 'traverseEnlargmentRange'>(differencesDetectionService, 'traverseEnlargmentRange')
                .mockImplementation(async () => {});
            const traverseSurroundingPixelsSpy = jest
                .spyOn<any, 'traverseSurroundingPixels'>(differencesDetectionService, 'traverseSurroundingPixels')
                .mockImplementation(async () => {});

            await differencesDetectionService['findWholeDifference']();
            expect(canSkipEnlargmentRangeTraversalSpy).toHaveBeenCalled();
            expect(traverseEnlargmentRangeSpy).toHaveBeenCalled();
            expect(traverseSurroundingPixelsSpy).toHaveBeenCalled();
        });
    });

    describe('traverseSurroundingPixels', () => {
        it('should only add different surrounding pixels', async () => {
            differencesDetectionService['originalImage'] = await Jimp.read(originalImagePath);
            differencesDetectionService['modifiedImage'] = await Jimp.read(modifiedImagePath);
            jest.spyOn<any, 'isInsideImage'>(differencesDetectionService, 'isInsideImage').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'isSamePixel'>(differencesDetectionService, 'isSamePixel').mockImplementation(() => {
                return false;
            });
            const centerPixel = { x: 90, y: 144 };
            const expectedResult = [
                { x: 90, y: 144 },
                { x: 90, y: 145 },
                { x: 91, y: 144 },
                { x: 91, y: 145 },
            ];
            await differencesDetectionService['traverseSurroundingPixels'](centerPixel);
            expect(differencesDetectionService['pixelsToProcess']).toEqual(expectedResult);
        });
    });

    describe('traverseEnlargmentRange', () => {
        it('should correctly handle same color and different color pixels', async () => {
            const addedPixels = new Array();
            differencesDetectionService['originalImage'] = await Jimp.read(originalImagePath);
            differencesDetectionService['modifiedImage'] = await Jimp.read(modifiedImagePath);
            jest.spyOn<any, 'isInsideImage'>(differencesDetectionService, 'isInsideImage').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'isNewPixel'>(differencesDetectionService, 'isNewPixel').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'addPixelToDifference'>(differencesDetectionService, 'addPixelToDifference').mockImplementation((coord: Coordinate) => {
                addedPixels.push(coord);
            });

            differencesDetectionService['enlargmentRange'] = ENLARGMENT_RANGE_STUB;

            const pixel = { x: 90, y: 144 };
            await differencesDetectionService['traverseEnlargmentRange'](pixel, new Array());

            expect(differencesDetectionService['pixelsToProcess']).toEqual(EXPECTED_ENLARGMENT_RANGE_PIXELS_TO_PROCESS);
            expect(addedPixels).toEqual(EXPECTED_ENLARGMENT_RANGE_ADDED_PIXELS);
        });
    });

    describe('canSkipEnlargmentRangeTraversal', () => {
        beforeEach(() => {
            jest.spyOn<any, 'isInsideImage'>(differencesDetectionService, 'isInsideImage').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'isSamePixel'>(differencesDetectionService, 'isSamePixel').mockImplementation(() => {
                return false;
            });
            cardStub.enlargementRadius = 3;
        });

        it('should return true if surrounded by different pixels', async () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return false;
            });

            const pixel = { x: 100, y: 150 };
            const result = await differencesDetectionService['canSkipEnlargmentRangeTraversal'](pixel);
            expect(result).toBe(true);
        });

        it('should return false if there is a non-different pixel in the surroundings', async () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return true;
            });

            const pixel = { x: 91, y: 144 };
            const result = await differencesDetectionService['canSkipEnlargmentRangeTraversal'](pixel);
            expect(result).toBe(false);
        });

        it('should return true and not execute the rest of the method if enlargment radius is 0', async () => {
            const pixelStub = { x: 0, y: 0 };
            cardStub.enlargementRadius = 0;
            const isSameColorSpy = jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor');
            const isInsideImageSpy = jest.spyOn<any, 'isInsideImage'>(differencesDetectionService, 'isInsideImage');
            const isSamePixelSpy = jest.spyOn<any, 'isSamePixel'>(differencesDetectionService, 'isSamePixel');

            const result = await differencesDetectionService['canSkipEnlargmentRangeTraversal'](pixelStub);
            expect(result).toBe(true);
            expect(isSameColorSpy).not.toHaveBeenCalled();
            expect(isInsideImageSpy).not.toHaveBeenCalled();
            expect(isSamePixelSpy).not.toHaveBeenCalled();
        });
    });

    describe('initializeArrays', () => {
        it('should initialize enlargmentRange, pixelsToProcess and addedPixels', async () => {
            await differencesDetectionService['initializeArrays']();
            expect(differencesDetectionService['addedPixels']).toBeInstanceOf(Array);
            differencesDetectionService['addedPixels'].forEach((array) => {
                expect(array).toBeInstanceOf(Array);
            });
            expect(differencesDetectionService['pixelsToProcess']).toBeInstanceOf(Array);
            expect(differencesDetectionService['enlargmentRange']).toBeInstanceOf(Array);
        });
    });

    describe('precomputeEnlargementRange', () => {
        it('should correctly compute values', async () => {
            differencesDetectionService['card'].enlargementRadius = 3;
            await differencesDetectionService['precomputeEnlargementRange']();
            expect(differencesDetectionService['enlargmentRange']).toEqual(ENLARGMENT_RANGE_STUB);
        });
    });

    describe('getDifferencesOccupiedSpace', () => {
        it('should return 0.5 if half of the image is a different', () => {
            const numberOfPixels = WIDTH * HEIGHT;
            cardStub.differences = new Array();
            cardStub.differences[0] = new Array();
            for (let i = 0; i < numberOfPixels / 2; i++) {
                cardStub.differences[0].push({ x: i % WIDTH, y: Math.floor(i / WIDTH) });
            }
            const result = differencesDetectionService['getDifferencesOccupiedSpace'](cardStub);
            const expectedResult = 0.5;
            expect(result).toEqual(expectedResult);
        });
    });

    describe('addPixelToDifference', () => {
        it('should add a given pixel to the difference', () => {
            const pixel = { x: 0, y: 0 };
            differencesDetectionService['addPixelToDifference'](pixel, differenceStub);
            expect(differenceStub).toContain(pixel);
        });
    });

    describe('isSameColor', () => {
        beforeEach(async () => {
            differencesDetectionService['originalImage'] = await Jimp.read(originalImagePath);
            differencesDetectionService['modifiedImage'] = await Jimp.read(modifiedImagePath);
        });

        it('should return true if a given pixel has the same color on the original and the modified image', () => {
            const pixel = { x: 0, y: 0 };
            const result = differencesDetectionService['isSameColor'](pixel);
            expect(result).toBe(true);
        });

        it('should return false if a given pixel has a different color on the original and the modified image', () => {
            const pixel = { x: 100, y: 150 };
            const result = differencesDetectionService['isSameColor'](pixel);
            expect(result).toBe(false);
        });
    });

    describe('isNewDifferentPixel', () => {
        let pixelStub: Coordinate;

        beforeEach(() => {
            pixelStub = { x: 0, y: 0 };
        });

        it('should return true if pixel is of different color and is not in a list', () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return false;
            });
            jest.spyOn<any, 'isNewPixel'>(differencesDetectionService, 'isNewPixel').mockImplementation(() => {
                return true;
            });
            const result = differencesDetectionService['isNewDifferentPixel'](pixelStub);
            expect(result).toBe(true);
        });

        it('should return false if pixel is the same color and is not in a list', () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'isNewPixel'>(differencesDetectionService, 'isNewPixel').mockImplementation(() => {
                return true;
            });
            const result = differencesDetectionService['isNewDifferentPixel'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel is the same color and is in a list', () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return true;
            });
            jest.spyOn<any, 'isNewPixel'>(differencesDetectionService, 'isNewPixel').mockImplementation(() => {
                return false;
            });
            const result = differencesDetectionService['isNewDifferentPixel'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel is not the same color, but is in a list', () => {
            jest.spyOn<any, 'isSameColor'>(differencesDetectionService, 'isSameColor').mockImplementation(() => {
                return false;
            });
            jest.spyOn<any, 'isNewPixel'>(differencesDetectionService, 'isNewPixel').mockImplementation(() => {
                return false;
            });
            const result = differencesDetectionService['isNewDifferentPixel'](pixelStub);
            expect(result).toBe(false);
        });
    });

    describe('isNewPixel', () => {
        let pixelStub: Coordinate;

        beforeEach(async () => {
            pixelStub = { x: 0, y: 0 };
            await differencesDetectionService['initializeArrays']();
        });

        it("should return true if pixel hasn't been added yet and isn't to be processed", () => {
            const result = differencesDetectionService['isNewPixel'](pixelStub);
            expect(result).toBe(true);
        });

        it("should return false if pixel has already been added yet and isn't to be processed", () => {
            differencesDetectionService['addedPixels'][pixelStub.x][pixelStub.y] = 1;
            const result = differencesDetectionService['isNewPixel'](pixelStub);
            expect(result).toBe(false);
        });

        it("should return false if pixel hasn't been added yet, but is to be processed", () => {
            differencesDetectionService['pixelsToProcess'].push(pixelStub);
            const result = differencesDetectionService['isNewPixel'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel has already been added and is to be processed', () => {
            differencesDetectionService['addedPixels'][pixelStub.x][pixelStub.y] = 1;
            differencesDetectionService['pixelsToProcess'].push(pixelStub);
            const result = differencesDetectionService['isNewPixel'](pixelStub);
            expect(result).toBe(false);
        });
    });

    describe('isInsideImage', () => {
        it('should return true if pixel is inside image', () => {
            const pixelStub = { x: 100, y: 150 };
            const result = differencesDetectionService['isInsideImage'](pixelStub);
            expect(result).toBe(true);
        });

        it('should return false if pixel is too low on x axis', () => {
            const pixelStub = { x: -100, y: 150 };
            const result = differencesDetectionService['isInsideImage'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel is high low on x axis', () => {
            const pixelStub = { x: 1000, y: 150 };
            const result = differencesDetectionService['isInsideImage'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel is too low on y axis', () => {
            const pixelStub = { x: 100, y: -100 };
            const result = differencesDetectionService['isInsideImage'](pixelStub);
            expect(result).toBe(false);
        });

        it('should return false if pixel is too high on y axis', () => {
            const pixelStub = { x: 100, y: 1000 };
            const result = differencesDetectionService['isInsideImage'](pixelStub);
            expect(result).toBe(false);
        });
    });

    describe('isSamePixel', () => {
        it('should return true if pixels have the same x and y values', () => {
            const firstPixel = { x: 5, y: 5 };
            const secondPixel = { x: 5, y: 5 };
            const result = differencesDetectionService['isSamePixel'](firstPixel, secondPixel);
            expect(result).toBe(true);
        });

        it('should return false if pixels have the same x, but different y values', () => {
            const firstPixel = { x: 5, y: 5 };
            const secondPixel = { x: 5, y: 15 };
            const result = differencesDetectionService['isSamePixel'](firstPixel, secondPixel);
            expect(result).toBe(false);
        });

        it('should return false if pixels have the different x, but the same y values', () => {
            const firstPixel = { x: 5, y: 5 };
            const secondPixel = { x: 15, y: 5 };
            const result = differencesDetectionService['isSamePixel'](firstPixel, secondPixel);
            expect(result).toBe(false);
        });

        it('should return false if pixels have different x and y values', () => {
            const firstPixel = { x: 5, y: 5 };
            const secondPixel = { x: 15, y: 15 };
            const result = differencesDetectionService['isSamePixel'](firstPixel, secondPixel);
            expect(result).toBe(false);
        });
    });

    describe('cardIsConfigured', () => {
        let card: Card;
        let imagesStub: Images;

        beforeEach(async () => {
            const originalImageStub = Buffer.from(originalImagePath);
            const modifiedImageStub = Buffer.from(modifiedImagePath);
            imagesStub = { originalImage: originalImageStub, modifiedImage: modifiedImageStub };
            card = new Card();
        });

        it('should return true if everything is correctly configured', () => {
            card.enlargementRadius = 0;
            const result = differencesDetectionService['checkComputeDifferencesRequirements'](card, imagesStub);
            expect(result).toBe(true);
        });

        it('should return false if original image is not set', () => {
            card.enlargementRadius = 0;
            imagesStub.originalImage = undefined;
            const result = differencesDetectionService['checkComputeDifferencesRequirements'](card, imagesStub);
            expect(result).toBe(false);
        });

        it('should return false if modified image is not set', () => {
            card.enlargementRadius = 0;
            imagesStub.modifiedImage = undefined;
            const result = differencesDetectionService['checkComputeDifferencesRequirements'](card, imagesStub);
            expect(result).toBe(false);
        });

        it("should return false if card's enlargment radius is not set", () => {
            const result = differencesDetectionService['checkComputeDifferencesRequirements'](card, imagesStub);
            expect(result).toBe(false);
        });
    });
});
