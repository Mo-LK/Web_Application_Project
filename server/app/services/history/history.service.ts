import { GameHistory } from '@app/model/database/game-history';
import { DatabaseService } from '@app/services/database/database.service';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class HistoryService {
    constructor(private readonly databaseService: DatabaseService) {}

    async removeHistory(filter: FilterQuery<GameHistory>): Promise<void> {
        await this.databaseService.removeHistory(filter);
    }

    async getHistory(filter: FilterQuery<GameHistory>): Promise<GameHistory[]> {
        return await this.databaseService.findGameHistory(filter);
    }

    async createHistory(history: GameHistory): Promise<void> {
        await this.databaseService.createHistory(history);
    }
}
