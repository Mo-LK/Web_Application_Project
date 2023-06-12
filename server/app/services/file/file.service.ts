import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';
import { CARDS_LOCATION, CONSTANTS_PATH, DIFFERENCES_LOCATION, IMG_LOCATION, TESTS_FOLDER_NAME } from './file.service.constants';

@Injectable()
export class FileService {
    async getCard(id: string): Promise<Card> {
        const cardPath = this.getCardPath(id);
        const buffer = await fsPromise.readFile(cardPath);
        const card = JSON.parse(buffer.toString()) as Card;
        return card;
    }

    async getCardDifferences(id: string): Promise<Coordinate[][]> {
        const differencesPath = this.getDifferencesLocation(id);
        const differences = (await fsPromise.readFile(differencesPath)).toString();
        return JSON.parse(differences);
    }

    async getConstants(): Promise<GameConstants> {
        const constants = (await fsPromise.readFile(CONSTANTS_PATH)).toString();
        return JSON.parse(constants) as GameConstants;
    }

    async fileExists(folderPath: string): Promise<boolean> {
        // Source : https://nodejs.org/api/fs.html#fspromisesaccesspath-mode
        try {
            await fsPromise.access(folderPath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    getCardPath(id: string): string {
        return process.cwd() + '/' + CARDS_LOCATION + id + '.json';
    }

    getImageLocation(id: string, type: string): string {
        const folderPath = process.cwd() + '/' + IMG_LOCATION + id;
        return type === 'original' ? folderPath + '_original.bmp' : folderPath + '_modified.bmp';
    }

    getDifferencesLocation(id: string): string {
        return process.cwd() + '/' + DIFFERENCES_LOCATION + id + '_differences.json';
    }

    async saveDifferences(id: string, differences: Coordinate[][]): Promise<void> {
        const differencesPath = this.getDifferencesLocation(id);
        await fsPromise.writeFile(differencesPath, JSON.stringify(differences));
    }

    write(folderPath: string, data: string | NodeJS.ArrayBufferView) {
        fs.writeFileSync(folderPath, data);
    }

    async remove(folderPath: string): Promise<void> {
        await fsPromise.rm(folderPath);
    }

    async emptyFolder(folderPath: string): Promise<void> {
        const folderContents = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const file of folderContents) {
            if (file.name.startsWith('.') || file.name === TESTS_FOLDER_NAME) {
                continue;
            }
            const filePath = folderPath + '/' + file.name;
            const fileStats = fs.statSync(filePath);
            if (fileStats.isDirectory()) {
                const subFolderContents = fs.readdirSync(filePath);
                if (subFolderContents.length !== 0) {
                    await this.emptyFolder(filePath);
                }
            } else {
                fs.unlinkSync(filePath);
            }
        }
    }

    async getAllCardsFilenames(): Promise<string[]> {
        const cardsPath = process.cwd() + '/' + CARDS_LOCATION;
        return await fsPromise.readdir(cardsPath);
    }
}
