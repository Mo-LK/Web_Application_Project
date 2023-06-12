/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { GameHistory } from '@app/model/database/game-history';
import { CardService } from '@app/services/card/card.service';
import { DEFAULT_WINNERS } from '@app/services/stats/stats.service.constants';
import { Card } from '@common/card';
import { CardIO } from '@common/card-io';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { CardController } from './card.controller';

describe('CardController', () => {
    let cardController: CardController;
    let cardService: SinonStubbedInstance<CardService>;
    let res: Response;
    const UUID_STUB = '123456789';

    beforeEach(async () => {
        cardService = createStubInstance(CardService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CardController],
            providers: [
                {
                    provide: CardService,
                    useValue: cardService,
                },
            ],
        }).compile();

        cardController = module.get<CardController>(CardController);
        res = {} as unknown as Response;
    });

    it('should be defined', () => {
        expect(cardController).toBeDefined();
    });

    describe('saveCard', () => {
        let cardIoStub: CardIO;
        const firstImage = 'Zmlyc3RJbWFnZUJ1ZmZlckluQmFzZTY0';
        const secondImage = 'c2Vjb25kSW1hZ2VCdWZmZXJJbkJhc2U2NA==';
        const cardStub = {} as Card;

        beforeEach(() => {
            cardStub.enlargementRadius = 3;
            cardIoStub = { firstImage, secondImage, metadata: cardStub };
        });

        it('should return error 400 if the first image is missing', async () => {
            cardIoStub.firstImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });

        it('should return error 400 if the second image is missing', async () => {
            cardIoStub.secondImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });

        it('should return error 400 if no image is given', async () => {
            cardIoStub.firstImage = undefined;
            cardIoStub.secondImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });

        it('should return error 500 there is a problem while saving the card', async () => {
            cardService.saveCard.rejects();
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                expect(message.body).toBeDefined();
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });

        it("should return error 400 if the card differences haven't been computed yet", async () => {
            cardService.saveCard.resolves();
            const expectedReturnMessage = { title: 'BAD REQUEST', body: "The card's differences haven't been computed yet" };
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });

        it('should return the id of the card if no error occured while saving', async () => {
            cardService.saveCard.resolves(UUID_STUB);
            const expectedReturnMessage = { title: 'OK', body: UUID_STUB };
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.saveCard(messageSent, res);
        });
    });

    describe('getAllHistory', () => {
        let fakeHistory: GameHistory;

        beforeEach(() => {
            fakeHistory = {} as GameHistory;
            fakeHistory.dateStarted = '2023-01-01';
            fakeHistory.timeStarted = '00:00:00 a.m.';
            fakeHistory.timeLength = '0.0';
            fakeHistory.gameType = 'Classique';
            fakeHistory.firstPlayer = 'Didier';
            fakeHistory.secondPlayer = 'Michel';
            fakeHistory.winnerSocketId = '123';
            fakeHistory.surrender = false;
            fakeHistory.firstPlayerSocketId = '123';
            fakeHistory.secondPlayerSocketId = '000';
        });

        it('should return all the history', async () => {
            cardService.getAllHistory.resolves([fakeHistory, fakeHistory]);
            const expectedMessage = { title: 'OK', body: JSON.stringify([fakeHistory, fakeHistory]) };

            res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedMessage);
                return res;
            };

            await cardController.getAllHistory(res);
        });

        it('should return error 500 if there is a problem while getting the history', async () => {
            cardService.getAllHistory.rejects();
            const expectedMessage = { title: 'INTERNAL SERVER ERROR', body: 'Error' };

            res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedMessage);
                return res;
            };

            await cardController.getAllHistory(res);
        });
    });

    describe('resetHistory', () => {
        it('should return OK if the history has been reset', async () => {
            cardService.resetHistory.resolves();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NO_CONTENT);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.resetHistory(res);
        });

        it('should return error 404 if there is a problem while resetting the history', async () => {
            cardService.resetHistory.rejects();
            const expectedMessage = { title: 'INTERNAL SERVER ERROR', body: 'Error' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedMessage);
                return res;
            };
            await cardController.resetHistory(res);
        });
    });

    describe('getCard', () => {
        let differenceStub: Coordinate[];
        let fakeCard: Card;

        beforeEach(() => {
            differenceStub = [
                { x: 10, y: 10 },
                { x: 5, y: 5 },
                { x: 1, y: 1 },
            ];
            fakeCard = {} as Card;
            fakeCard.enlargementRadius = 3;
            fakeCard.difficultyLevel = 'difficile';
            fakeCard.id = UUID_STUB;
            fakeCard.title = 'card title';
            fakeCard.stats = DEFAULT_WINNERS;
            fakeCard.differences = [differenceStub, differenceStub];
        });

        it('should return the card', async () => {
            cardService.getCard.resolves(fakeCard);
            const expectedMessage = { title: 'OK', body: JSON.stringify(fakeCard) };

            res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedMessage);
                return res;
            };

            await cardController.getCard(UUID_STUB, res);
        });

        it('should return error 500 if there is a problem while getting the card', async () => {
            cardService.getCard.rejects();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NOT_FOUND);
                return res;
            };

            res.send = (message) => {
                expect(message.title).toEqual('NOT FOUND');
                expect(message.body).toBeDefined();
                return res;
            };

            await cardController.getCard(UUID_STUB, res);
        });
    });

    describe('getAllCards', () => {
        let differenceStub: Coordinate[];
        let fakeCards: Card[];

        beforeEach(() => {
            differenceStub = [
                { x: 10, y: 10 },
                { x: 5, y: 5 },
                { x: 1, y: 1 },
            ];
            const fakeCard = {} as Card;
            fakeCard.enlargementRadius = 3;
            fakeCard.difficultyLevel = 'difficile';
            fakeCard.id = UUID_STUB;
            fakeCard.title = 'card title';
            fakeCard.stats = DEFAULT_WINNERS;
            fakeCard.differences = [differenceStub, differenceStub];
            fakeCards = new Array();
            fakeCards.push(fakeCard);
            fakeCards.push(fakeCard);
            fakeCards.push(fakeCard);
            fakeCards.push(fakeCard);
            fakeCards.push(fakeCard);
        });

        it('should return the card', async () => {
            cardService.getAllCards.resolves(fakeCards);
            const expectedMessage = { title: 'OK', body: JSON.stringify(fakeCards) };

            res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedMessage);
                return res;
            };

            await cardController.getAllCards(res);
        });

        it('should return error 500 if there is a problem while getting the card', async () => {
            cardService.getAllCards.rejects();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };

            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                expect(message.body).toBeDefined();
                return res;
            };

            await cardController.getAllCards(res);
        });
    });

    describe('deleteCard', () => {
        it('should return status 204 with empty body if deleting the card was successful', async () => {
            cardService.deleteCard.resolves(true);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NO_CONTENT);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.deleteCard(UUID_STUB, res);
        });

        it('should return error 500 if deleting the card was not successful', async () => {
            const expectedReturnMessage = { title: 'NOT FOUND', body: "Couldn't delete Card with id " + UUID_STUB };
            cardService.deleteCard.resolves(false);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NOT_FOUND);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.deleteCard(UUID_STUB, res);
        });
    });

    describe('deleteAllCards', () => {
        it('should return status 204 with empty body if deleting all cards was successful', async () => {
            cardService.deleteAllCards.resolves(true);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NO_CONTENT);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.deleteAllCards(res);
        });

        it('should return error 500 if deleting all cards was not successful', async () => {
            const expectedReturnMessage = { title: 'INTERNAL SERVER ERROR', body: "Couldn't delete all cards" };
            cardService.deleteAllCards.resolves(false);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.deleteAllCards(res);
        });
    });

    describe('resetStat', () => {
        it('should return status 204 with empty body if resetting the stat was successful', async () => {
            cardService.resetStat.resolves();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NO_CONTENT);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.resetStat(UUID_STUB, res);
        });

        it('should return error 404 if the card could not be found', async () => {
            cardService.resetStat.rejects();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NOT_FOUND);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('NOT FOUND');
                return res;
            };
            await cardController.resetStat(UUID_STUB, res);
        });
    });

    describe('getConstants', () => {
        it('should return status 200 with constants if getting the constants was successful', async () => {
            cardService.getGameConstants.resolves({ initial: 4, gain: 1, penalty: 3 } as GameConstants);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('OK');
                return res;
            };
            await cardController.getConstants(res);
        });

        it('should return error 500 if getConstants generates error ', async () => {
            cardService.getGameConstants.rejects();
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                return res;
            };
            await cardController.getConstants(res);
        });
    });

    describe('setConstants', () => {
        it('should return status 200 with empty body if setting the constants was successful', async () => {
            cardService.setConstants.returns(true);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.setConstants({ title: 'constants', body: JSON.stringify({} as GameConstants) }, res);
        });

        it('should return error 400 if the constants are not valid', async () => {
            cardService.setConstants.returns(false);

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('BAD REQUEST');
                return res;
            };
            await cardController.setConstants({ title: 'constants', body: JSON.stringify({} as GameConstants) }, res);
        });

        it('should return error 500 if the request generates an error', async () => {
            cardService.setConstants.resolves();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                return res;
            };
            await cardController.setConstants({ title: 'constants', body: JSON.stringify({} as GameConstants) }, res);
        });
    });

    describe('resetStats', () => {
        it('should return status 204 with empty body if resetting the stats was successful', async () => {
            cardService.resetAllStats.resolves();

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NO_CONTENT);
                return res;
            };
            res.send = (message) => {
                expect(message).toBeUndefined();
                return res;
            };
            await cardController.resetStats(res);
        });

        it('should return error 500 if resetAllStats generates error ', async () => {
            cardService.resetAllStats.rejects();
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.body).toEqual('Error');
                return res;
            };
            await cardController.resetStats(res);
        });
    });

    describe('getDifferencesImage', () => {
        let cardIoStub: CardIO;
        const firstImage = 'Zmlyc3RJbWFnZUJ1ZmZlckluQmFzZTY0';
        const secondImage = 'c2Vjb25kSW1hZ2VCdWZmZXJJbkJhc2U2NA==';
        const cardStub = {} as Card;

        beforeEach(() => {
            cardStub.enlargementRadius = 3;
            cardIoStub = { firstImage, secondImage, metadata: cardStub };
        });

        it('should return error 400 if the first image is missing', async () => {
            cardIoStub.firstImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });

        it('should return error 400 if the second image is missing', async () => {
            cardIoStub.secondImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });

        it('should return error 400 if no image is given', async () => {
            cardIoStub.firstImage = undefined;
            cardIoStub.secondImage = undefined;
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const expectedReturnMessage = { title: 'BAD REQUEST', body: 'Request badly formulated. Information missing' };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });

        it('should return error 500 there is a problem while computing differences', async () => {
            cardService.computeCardDifferences.rejects();
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });

        it('should return error 500 there is a problem while generating the differences image', async () => {
            cardService.getDifferencesImage.rejects();
            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
                return res;
            };
            res.send = (message) => {
                expect(message.title).toEqual('INTERNAL SERVER ERROR');
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });

        it('should return the card with the difference image if everything went fine', async () => {
            const differencesImage = Buffer.from('ZGlmZmVyZW5jZUltYWdl', 'base64');
            cardService.computeCardDifferences.resolves(cardStub);
            cardService.getDifferencesImage.resolves(differencesImage);

            const messageSent = { title: '', body: JSON.stringify(cardIoStub) };
            const cardIoStubReturned = {} as CardIO;
            cardIoStubReturned.firstImage = 'ZGlmZmVyZW5jZUltYWdl';
            cardIoStubReturned.metadata = cardStub;
            const expectedReturnMessage = { title: 'OK', body: JSON.stringify(cardIoStubReturned) };

            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual(expectedReturnMessage);
                return res;
            };
            await cardController.getDifferencesImage(messageSent, res);
        });
    });

    describe('toMessage', () => {
        it('should return the data with the appropriate format', () => {
            const title = 'Title';
            const data = 'This is data';
            const result = cardController['toMessage'](title, data);
            expect(result).toEqual({ title, body: data });
        });
    });
});
