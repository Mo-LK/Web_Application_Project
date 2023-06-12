import { GameHistory, GameHistoryDocument } from '@app/model/database/game-history';
import { PlayerStats, StatDocument } from '@app/model/database/player-stats';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(PlayerStats.name) public statModel: Model<StatDocument>,
        @InjectModel(GameHistory.name) public gameHistoryModel: Model<GameHistoryDocument>,
    ) {}

    async findStats(filter: FilterQuery<PlayerStats>): Promise<PlayerStats[]> {
        try {
            return this.statModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async findGameHistory(filter: FilterQuery<GameHistory>): Promise<GameHistory[]> {
        try {
            return this.gameHistoryModel.find(filter);
        } catch (error) {
            return [];
        }
    }

    async createStats(stat: PlayerStats): Promise<PlayerStats> {
        try {
            return this.statModel.create(stat);
        } catch (error) {
            return {} as PlayerStats;
        }
    }

    async createHistory(history: GameHistory): Promise<GameHistory> {
        try {
            return this.gameHistoryModel.create(history);
        } catch (error) {
            return {} as GameHistory;
        }
    }

    async remove(filter: FilterQuery<PlayerStats>): Promise<unknown> {
        try {
            return this.statModel.deleteMany(filter);
        } catch (error) {
            return;
        }
    }

    async removeHistory(filter: FilterQuery<GameHistory>): Promise<unknown> {
        try {
            return this.gameHistoryModel.deleteMany(filter);
        } catch (error) {
            return;
        }
    }
}
