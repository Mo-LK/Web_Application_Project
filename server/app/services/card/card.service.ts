import { CardsManagerGateway } from '@app/gateways/cards-manager/cards-manager.gateway';
import { GameHistory } from '@app/model/database/game-history';
import { Images } from '@app/model/interfaces/images';
import { ConstantsService } from '@app/services/constants/constants.service';
import { DifferencesDetectionService } from '@app/services/differences-detection/differences-detection.service';
import { FileService } from '@app/services/file/file.service';
import { CARDS_LOCATION, DIFFERENCES_LOCATION, IMG_LOCATION } from '@app/services/file/file.service.constants';
import { HistoryService } from '@app/services/history/history.service';
import { StatsService } from '@app/services/stats/stats.service';
import { DEFAULT_WINNERS } from '@app/services/stats/stats.service.constants';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';
import { EMPTY_FILTER } from './card.service.constants';

@Injectable()
export class CardService {
    // Acceptable because service is a center piece of the server
    // eslint-disable-next-line max-params
    constructor(
        private readonly differencesDetectionService: DifferencesDetectionService,
        private readonly statsService: StatsService,
        private readonly fileService: FileService,
        private readonly cardsManagerGateway: CardsManagerGateway,
        private readonly historyService: HistoryService,
        private readonly constantService: ConstantsService,
    ) {}

    async saveCard(card: Card, images: Images): Promise<string> {
        if (!card.differences || card.differences.length === 0) {
            return;
        }

        if (!card.id) {
            await this.generateCardUUID(card);
        }
        card.stats = await this.statsService.getDefaultStats();
        const cardPath = this.fileService.getCardPath(card.id);
        await this.statsService.saveStats(card);
        await this.fileService.saveDifferences(card.id, card.differences);
        const originalImagePath = this.fileService.getImageLocation(card.id, 'original');
        const modifiedImagePath = this.fileService.getImageLocation(card.id, 'modified');
        this.fileService.write(originalImagePath, images.originalImage);
        this.fileService.write(modifiedImagePath, images.modifiedImage);
        this.cardsManagerGateway.handleCreatedCard(card);
        card.stats.classical = undefined;
        this.fileService.write(cardPath, JSON.stringify(card));
        return card.id;
    }

    async deleteCard(id: string): Promise<boolean> {
        try {
            await this.fileService.remove(this.fileService.getImageLocation(id, 'original'));
            await this.fileService.remove(this.fileService.getImageLocation(id, 'modified'));
            await this.fileService.remove(this.fileService.getDifferencesLocation(id));
            await this.fileService.remove(this.fileService.getCardPath(id));
            await this.statsService.remove({ cardId: id, firstMode: 'classique' });
            await this.statsService.remove({ cardId: id, firstMode: 'Temps limité' });
            const cards = await this.getAllCards();
            this.cardsManagerGateway.handleDeletedCard(id, cards.length);
            return true;
        } catch {
            return false;
        }
    }

    async deleteAllCards(): Promise<boolean> {
        try {
            const cards = await this.getAllCards();
            await this.fileService.emptyFolder(process.cwd() + '/' + IMG_LOCATION);
            await this.fileService.emptyFolder(process.cwd() + '/' + DIFFERENCES_LOCATION);
            await this.fileService.emptyFolder(process.cwd() + '/' + CARDS_LOCATION);
            await this.statsService.remove(EMPTY_FILTER);
            cards.forEach((card: Card) => {
                this.cardsManagerGateway.handleDeletedCard(card.id, 0);
            });
            return true;
        } catch {
            return false;
        }
    }

    async setStats(id: string, stats: CardStats): Promise<Card> {
        if (!stats || !stats.classical) {
            stats = await this.statsService.getDefaultStats();
        }
        this.statsService.remove({ cardId: id });
        const card = await this.getCardMetadata(id);
        card.stats = stats;
        this.statsService.saveStats(card);
        return card;
    }

    setConstants(gameConstants: GameConstants): boolean {
        const isValid = this.constantService.setConstants(gameConstants);
        if (isValid) this.cardsManagerGateway.handleConstantChanged(gameConstants);
        return isValid;
    }

    async getCard(id: string): Promise<Card> {
        const card = await this.getCardMetadata(id);
        card.differences = await this.fileService.getCardDifferences(id);
        return card;
    }

    async getGameConstants(): Promise<GameConstants> {
        return await this.fileService.getConstants();
    }

    async getAllCards(): Promise<Card[]> {
        const files = await this.fileService.getAllCardsFilenames();
        const cards: Card[] = new Array();
        for (const file of files) {
            cards.push(await this.getCard(this.extractId(file)));
        }
        return cards;
    }

    async getAllHistory(): Promise<GameHistory[]> {
        return await this.historyService.getHistory(EMPTY_FILTER);
    }

    async getCardMetadata(id: string): Promise<Card> {
        const card = await this.fileService.getCard(id);
        card.stats = await this.statsService.getCardStats(id);
        return card;
    }

    async getDifferenceFromPixel(id: string, pixel: Coordinate, differences: Coordinate[][]): Promise<Coordinate[]> {
        const pixelIsInDifference = (difference: Coordinate[]) => {
            return difference.some((coord: Coordinate) => {
                return coord.x === Number(pixel.x) && coord.y === Number(pixel.y);
            });
        };
        return differences.find(pixelIsInDifference);
    }

    async computeCardDifferences(card: Card, images: Images): Promise<Card> {
        card.differences = await this.differencesDetectionService.computeDifferences(card, images);
        card.difficultyLevel = await this.differencesDetectionService.getDifficultyLevel(card);
        return card;
    }

    async getDifferencesImage(card: Card): Promise<Buffer> {
        const differencesImage = await this.differencesDetectionService.generateDifferencesImage(card);
        return differencesImage.getBufferAsync(Jimp.MIME_BMP);
    }

    async resetAllStats() {
        (await this.getAllCards()).forEach(async (card) => {
            await this.resetStat(card.id);
        });
    }

    async resetStat(cardId: string) {
        const card = { id: cardId, stats: DEFAULT_WINNERS } as Card;
        await this.statsService.remove({ cardId });
        await this.statsService.saveStats(card);
        this.cardsManagerGateway.handleStatChanged(card);
    }

    async resetHistory() {
        try {
            await this.historyService.removeHistory(EMPTY_FILTER);
            this.cardsManagerGateway.notifyResetHistory();
            return true;
        } catch (error) {
            return false;
        }
    }

    updateClientStats(card: Card) {
        this.cardsManagerGateway.handleStatChanged(card);
    }

    updateClientLimitedModeEnable(cardsLength) {
        this.cardsManagerGateway.handleLimitedModeEnable(cardsLength);
    }

    private async generateCardUUID(card: Card): Promise<void> {
        do {
            card.id = String(Date.now());
        } while (await this.fileService.fileExists(this.fileService.getCardPath(card.id)));
    }

    private extractId = (filename: string) => {
        const LAST_DIGIT_INDEX = -5;
        return filename.slice(0, LAST_DIGIT_INDEX);
    };
}
