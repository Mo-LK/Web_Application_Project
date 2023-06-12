import { Images } from '@app/model/interfaces/images';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';
import { BLACK, HEIGHT, NUMBER_OF_DIFFERENCES_THRESHOLD, OCCUPIED_SPACE_THRESHOLD, WHITE, WIDTH } from './differences-detection.service.constants';

@Injectable()
export class DifferencesDetectionService {
    private card: Card;
    private addedPixels: number[][];
    private enlargmentRange: Coordinate[];
    private pixelsToProcess: Coordinate[]; // Used as a queue
    private originalImage: Jimp;
    private modifiedImage: Jimp;

    constructor() {
        this.initializeArrays();
    }

    async computeDifferences(card: Card, images: Images): Promise<Coordinate[][]> {
        if (!this.checkComputeDifferencesRequirements(card, images)) {
            return;
        }

        this.originalImage = await Jimp.read(images.originalImage);
        this.modifiedImage = await Jimp.read(images.modifiedImage);

        this.card = card;
        await this.initializeArrays();
        const differences: Coordinate[][] = new Array();

        this.precomputeEnlargementRange();

        for (let i = 0; i < WIDTH; i++) {
            for (let j = 0; j < HEIGHT; j++) {
                if (this.isNewDifferentPixel({ x: i, y: j })) {
                    this.pixelsToProcess.push({ x: i, y: j });
                    differences.push(await this.findWholeDifference());
                }
            }
        }

        card.differences = differences;
        return differences;
    }

    async getDifficultyLevel(card: Card): Promise<string> {
        if (
            (await this.getNumberOfDifferences(card)) >= NUMBER_OF_DIFFERENCES_THRESHOLD &&
            this.getDifferencesOccupiedSpace(card) <= OCCUPIED_SPACE_THRESHOLD
        ) {
            return 'difficile';
        }
        return 'facile';
    }

    async generateDifferencesImage(card: Card): Promise<Jimp> {
        const differenceImage = new Jimp(WIDTH, HEIGHT);
        for (let x = 0; x < differenceImage.getWidth(); x++) {
            for (let y = 0; y < differenceImage.getHeight(); y++) {
                differenceImage.setPixelColor(WHITE, x, y);
            }
        }

        if (card.differences) {
            for (const difference of card.differences) {
                for (const pixel of difference) {
                    differenceImage.setPixelColor(BLACK, pixel.x, pixel.y);
                }
            }
        }
        return differenceImage;
    }

    async getNumberOfDifferences(card: Card): Promise<number> {
        return card.differences.length;
    }

    private async findWholeDifference(): Promise<Coordinate[]> {
        const difference: Coordinate[] = new Array();
        let currentPixel: Coordinate;
        while (this.pixelsToProcess.length > 0) {
            currentPixel = this.pixelsToProcess.shift();
            if (!(await this.canSkipEnlargmentRangeTraversal(currentPixel))) {
                await this.traverseEnlargmentRange(currentPixel, difference);
            }
            await this.traverseSurroundingPixels(currentPixel);
            this.addPixelToDifference(currentPixel, difference);
        }
        return difference;
    }

    private async traverseSurroundingPixels(coord: Coordinate): Promise<void> {
        let neighbor: Coordinate;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                neighbor = { x: coord.x + i, y: coord.y + j };
                if (this.isInsideImage(neighbor) && !this.isSamePixel(coord, neighbor) && this.isNewDifferentPixel(neighbor)) {
                    this.pixelsToProcess.push(neighbor);
                }
            }
        }
    }

    private async traverseEnlargmentRange(pixel: Coordinate, difference: Coordinate[]): Promise<void> {
        let enlargmentNeighbor: Coordinate;
        for (const enlargment of this.enlargmentRange) {
            enlargmentNeighbor = { x: pixel.x + enlargment.x, y: pixel.y + enlargment.y };
            if (this.isInsideImage(enlargmentNeighbor) && this.isNewPixel(enlargmentNeighbor)) {
                if (this.isSameColor(enlargmentNeighbor)) {
                    this.addPixelToDifference(enlargmentNeighbor, difference);
                } else {
                    this.pixelsToProcess.push(enlargmentNeighbor);
                }
            }
        }
    }

    private async canSkipEnlargmentRangeTraversal(coord: Coordinate): Promise<boolean> {
        if (this.card.enlargementRadius === 0) {
            return true;
        }

        let neighbor: Coordinate;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                neighbor = { x: coord.x + i, y: coord.y + j };
                if (this.isSameColor(neighbor) && this.isInsideImage(neighbor) && !this.isSamePixel(coord, neighbor)) {
                    return false;
                }
            }
        }
        return true;
    }

    private async initializeArrays(): Promise<void> {
        this.enlargmentRange = new Array();
        this.pixelsToProcess = new Array();
        this.addedPixels = new Array(WIDTH);

        for (let i = 0; i < this.addedPixels.length; i++) {
            // We can't use forEach because we want to prevent every
            // second-dimension arrays from being linked (same reference)
            this.addedPixels[i] = new Array(HEIGHT);
            this.addedPixels[i].fill(0, 0, HEIGHT);
        }
    }

    private async precomputeEnlargementRange(): Promise<void> {
        const ENLARGMENT_RADIUS_SQUARED = this.card.enlargementRadius ** 2;
        for (let i = -this.card.enlargementRadius; i <= this.card.enlargementRadius; i++) {
            const highestYValue = Math.floor(Math.sqrt(ENLARGMENT_RADIUS_SQUARED - i ** 2));
            for (let j = highestYValue; i ** 2 + j ** 2 <= ENLARGMENT_RADIUS_SQUARED; j--) {
                if (!(i === 0 && j === 0)) {
                    this.enlargmentRange.push({ x: i, y: j });
                }
            }
        }
    }

    private getDifferencesOccupiedSpace(card: Card): number {
        let numberOfDifferentPixels = 0;
        for (const difference of card.differences) {
            numberOfDifferentPixels += difference.length;
        }
        const numberOfPixels = WIDTH * HEIGHT;
        return numberOfDifferentPixels / numberOfPixels;
    }

    private addPixelToDifference(pixel: Coordinate, difference: Coordinate[]): void {
        this.addedPixels[pixel.x][pixel.y] = 1;
        difference.push(pixel);
    }

    private isSameColor(coord: Coordinate): boolean {
        return this.originalImage.getPixelColor(coord.x, coord.y) === this.modifiedImage.getPixelColor(coord.x, coord.y);
    }

    private isNewDifferentPixel(pixel: Coordinate): boolean {
        return !this.isSameColor(pixel) && this.isNewPixel(pixel);
    }

    private isNewPixel(pixel: Coordinate): boolean {
        const isToBeProcessed = this.pixelsToProcess.some((toBeProcessedPixel) => {
            return toBeProcessedPixel.x === pixel.x && toBeProcessedPixel.y === pixel.y;
        });
        return this.addedPixels[pixel.x][pixel.y] === 0 && !isToBeProcessed;
    }

    private isInsideImage(coord: Coordinate): boolean {
        return 0 <= coord.x && coord.x < WIDTH && 0 <= coord.y && coord.y < HEIGHT;
    }

    private isSamePixel(first: Coordinate, second: Coordinate): boolean {
        return first.x === second.x && first.y === second.y;
    }

    private checkComputeDifferencesRequirements(card: Card, images: Images): boolean {
        return images.originalImage !== undefined && images.modifiedImage !== undefined && card.enlargementRadius !== undefined;
    }
}
