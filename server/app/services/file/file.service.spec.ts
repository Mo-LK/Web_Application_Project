/* eslint-disable @typescript-eslint/no-empty-function */
import { Card } from '@common/card';
import { GameConstants } from '@common/game-constants';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';
import { FileService } from './file.service';
import { CARDS_LOCATION, DIFFERENCES_LOCATION, IMG_LOCATION } from './file.service.constants';

describe('FileService', () => {
    const UUID_STUB = '123456789';
    let fileService: FileService;
    let cardStub: Card;

    beforeEach(async () => {
        cardStub = new Card();
        fileService = new FileService();
    });

    describe('getCard', () => {
        beforeEach(() => {
            jest.spyOn(fileService, 'getCardPath').mockImplementation(() => {
                return 'path/to/card';
            });
            jest.spyOn(fsPromise, 'readFile').mockImplementation(async () => {
                return Buffer.from(JSON.stringify(cardStub));
            });
        });

        it('should return a card with stats set', async () => {
            const card = await fileService.getCard(UUID_STUB);
            expect(card).toEqual(cardStub);
        });
    });

    describe('getCardDifferences', () => {
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
            jest.spyOn(fileService, 'getDifferencesLocation').mockImplementation(() => {
                return DIFFERENCES_LOCATION;
            });
            jest.spyOn(fsPromise, 'readFile').mockImplementation(async () => {
                return Buffer.from(JSON.stringify(differenceStub));
            });
        });

        it('should return the difference', async () => {
            const difference = await fileService.getCardDifferences(UUID_STUB);
            expect(difference).toEqual(differenceStub);
        });
    });

    describe('fileExists', () => {
        it('should return true if the file exists', async () => {
            jest.spyOn(fsPromise, 'access').mockImplementation(async () => {});
            const result = await fileService['fileExists']('existing_file');
            expect(result).toBe(true);
        });

        it("should return false if the file doesn't exist", async () => {
            jest.spyOn(fsPromise, 'access').mockImplementation(async () => {
                throw new Error();
            });
            const result = await fileService['fileExists']('non_existing_file');
            expect(result).toBe(false);
        });
    });

    describe('getCardPath', () => {
        let processCwdSpy: jest.SpyInstance;

        beforeEach(() => {
            processCwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => {
                return '/home/usr/projet2/server';
            });
        });

        it('should return the absolute path corresponding to the card id', () => {
            const expectedCardPath = '/home/usr/projet2/server/' + CARDS_LOCATION + UUID_STUB + '.json';
            const cardPath = fileService['getCardPath'](UUID_STUB);
            expect(processCwdSpy).toBeCalled();
            expect(cardPath).toEqual(expectedCardPath);
        });
    });

    describe('getImageLocation', () => {
        it('should return the absolute path for the original image if asked so', () => {
            const expectedResult = process.cwd() + '/' + IMG_LOCATION + UUID_STUB + '_original.bmp';
            const imagePath = fileService['getImageLocation'](UUID_STUB, 'original');
            expect(imagePath).toEqual(expectedResult);
        });

        it('should return the absolute path for the modified image if asked so', () => {
            const expectedResult = process.cwd() + '/' + IMG_LOCATION + UUID_STUB + '_modified.bmp';
            const imagePath = fileService['getImageLocation'](UUID_STUB, 'modified');
            expect(imagePath).toEqual(expectedResult);
        });
    });

    describe('getDifferencesLocation', () => {
        let processCwdSpy: jest.SpyInstance;

        beforeEach(() => {
            processCwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => {
                return '/home/usr/projet2/server';
            });
        });

        it('should return the absolute path to the differences corresponding to the given card id', () => {
            const expectedDifferencesPath = '/home/usr/projet2/server/' + DIFFERENCES_LOCATION + UUID_STUB + '_differences.json';
            const differencesPath = fileService['getDifferencesLocation'](UUID_STUB);
            expect(processCwdSpy).toBeCalled();
            expect(differencesPath).toEqual(expectedDifferencesPath);
        });
    });

    describe('saveDifferences', () => {
        let getDifferencesLocationSpy: jest.SpyInstance;
        let writeFileSpy: jest.SpyInstance;

        beforeEach(() => {
            getDifferencesLocationSpy = jest.spyOn(fileService, 'getDifferencesLocation').mockImplementation(() => {
                return '';
            });
            writeFileSpy = jest.spyOn(fsPromise, 'writeFile').mockImplementation(async () => {});
        });

        it('should write to disk', async () => {
            const differencesStub = new Array();
            await fileService['saveDifferences'](UUID_STUB, differencesStub);
            expect(getDifferencesLocationSpy).toBeCalledWith(UUID_STUB);
            expect(writeFileSpy).toBeCalledWith('', JSON.stringify(differencesStub));
        });
    });

    describe('write', () => {
        let fsPromiseRemoveStub: jest.SpyInstance;

        beforeEach(() => {
            fsPromiseRemoveStub = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        });

        it('should call the fs write function', async () => {
            const path = 'path/to/write';
            const data = 'datatobewritten';
            fileService.write(path, data);
            expect(fsPromiseRemoveStub).toBeCalledWith(path, data);
        });
    });

    describe('remove', () => {
        let fsPromiseRemoveStub: jest.SpyInstance;

        beforeEach(() => {
            fsPromiseRemoveStub = jest.spyOn(fsPromise, 'rm').mockImplementation(async () => {});
        });

        it('should call the database service remove function', async () => {
            const path = 'path/to/remove';
            await fileService.remove(path);
            expect(fsPromiseRemoveStub).toBeCalledWith(path);
        });
    });

    describe('getAllCardsFilename', () => {
        let fsPromiseReaddirStub: jest.SpyInstance;
        let processCwdSpy: jest.SpyInstance;

        beforeEach(() => {
            fsPromiseReaddirStub = jest.spyOn(fsPromise, 'readdir').mockImplementation(async () => {
                return [new fs.Dirent(), new fs.Dirent(), new fs.Dirent()];
            });
            processCwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => {
                return '/tmp';
            });
        });

        it('should call fsPromise readdir function', async () => {
            const expectedPath = '/tmp/' + CARDS_LOCATION;
            await fileService.getAllCardsFilenames();
            expect(processCwdSpy).toBeCalled();
            expect(fsPromiseReaddirStub).toBeCalledWith(expectedPath);
        });
    });

    describe('emptyFolder', () => {
        let fsPromiseReaddirSyncStub: jest.SpyInstance;
        let fsStatSyncStub: jest.SpyInstance;
        let fsPromiseUnlinkStub: jest.SpyInstance;
        let fakeDirent: fs.Dirent;
        let fakeDirentHidden: fs.Dirent;
        let fakeDirentTestsFolder: fs.Dirent;

        beforeEach(() => {
            fakeDirent = new fs.Dirent();
            fakeDirentHidden = new fs.Dirent();
            fakeDirentTestsFolder = new fs.Dirent();
            fakeDirent.name = 'test_original.bmp';
            fakeDirent.isFile = () => true;
            fakeDirentHidden.name = '.hiddenfilename.bmp';
            fakeDirentHidden.isFile = () => true;
            fakeDirentTestsFolder.name = 'tests';
            fakeDirentTestsFolder.isFile = () => false;
            fsPromiseUnlinkStub = jest.spyOn(fs, 'unlinkSync').mockImplementation(async () => {});
        });

        it('emptyFolder should skip hidden files and tests folder', async () => {
            fsPromiseReaddirSyncStub = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
                return [fakeDirent, fakeDirentHidden, fakeDirentTestsFolder];
            });
            fsStatSyncStub = jest.spyOn(fs, 'statSync').mockImplementation(() => {
                const stats = new fs.Stats();
                stats.isDirectory = () => false;
                return stats;
            });
            const dummyPath = '../../../assets/img/tests';
            await fileService.emptyFolder(dummyPath);
            expect(fsPromiseReaddirSyncStub).toBeCalled();
            expect(fsStatSyncStub).toBeCalled();
            expect(fsPromiseUnlinkStub).toBeCalled();
        });

        it('emptyFolder should call emptyFolder recursively', async () => {
            fsPromiseReaddirSyncStub = jest
                .spyOn(fs, 'readdirSync')
                .mockImplementationOnce(() => {
                    return [fakeDirent, fakeDirentHidden, fakeDirentTestsFolder];
                })
                .mockImplementation(() => {
                    return [fakeDirentHidden];
                });
            fsStatSyncStub = jest.spyOn(fs, 'statSync').mockImplementation(() => {
                const stats = new fs.Stats();
                stats.isDirectory = () => true;
                return stats;
            });
            const dummyPath = '../../../assets/img/tests';
            await fileService.emptyFolder(dummyPath);
            expect(fsPromiseReaddirSyncStub).toBeCalled();
            expect(fsStatSyncStub).toBeCalled();
        });
    });

    it('getConstants should call fsPromise.readFile function and return the parsed content of the file', async () => {
        const constants = { initial: 5 } as GameConstants;
        jest.spyOn(fsPromise, 'readFile').mockImplementation(async () => {
            return Buffer.from(JSON.stringify(constants));
        });
        const result = await fileService.getConstants();
        expect(result).toEqual(constants);
    });
});
