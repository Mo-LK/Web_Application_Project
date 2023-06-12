import { PlayerStats } from '@app/model/database/player-stats';
import { DatabaseService } from '@app/services/database/database.service';
import { FirstGameMode, SecondGameMode } from '@app/services/game-manager/game-manager.service.constants';
import { Card } from '@common/card';
import { CardStats, FirstModeStats, SecondModeStats } from '@common/card-stats';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { DEFAULT_WINNERS } from './stats.service.constants';

@Injectable()
export class StatsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async remove(filter: FilterQuery<PlayerStats>): Promise<void> {
        await this.databaseService.remove(filter);
    }

    async getCardStats(id: string): Promise<CardStats> {
        const stats = new CardStats();
        stats.classical = { solo: undefined, versus: undefined };
        stats.classical.solo = this.formatPlayerStats(
            await this.databaseService.findStats({ cardId: id, firstMode: FirstGameMode.CLASSIC, secondMode: SecondGameMode.SOLO }),
            FirstGameMode.CLASSIC,
        );
        stats.classical.versus = this.formatPlayerStats(
            await this.databaseService.findStats({ cardId: id, firstMode: FirstGameMode.CLASSIC, secondMode: SecondGameMode.VERSUS }),
            FirstGameMode.CLASSIC,
        );
        return stats;
    }

    async saveStats(card: Card): Promise<void> {
        await this.saveFirstModeStats(card.id, card.stats.classical, FirstGameMode.CLASSIC);
    }

    async getDefaultStats(): Promise<CardStats> {
        const stats = new CardStats();
        stats.classical = DEFAULT_WINNERS.classical;
        return stats;
    }

    async addStat(stat: PlayerStats): Promise<number> {
        const newEntry: PlayerStats = stat;
        let position = -1;
        const stats = JSON.parse(
            JSON.stringify(await this.databaseService.findStats({ cardId: stat.cardId, firstMode: stat.firstMode, secondMode: stat.secondMode })),
        );
        if (stats.length <= 2) {
            await this.databaseService.createStats(newEntry);
        } else {
            stats.push(newEntry);
            const sortedArray = this.sortStatArray(stats);
            const lastElement = sortedArray.pop();
            if (newEntry !== lastElement) {
                position = sortedArray.findIndex((entry) => {
                    return entry === newEntry;
                });
                await this.databaseService.createStats(newEntry);
                await this.databaseService.remove({
                    cardId: lastElement.cardId,
                    firstMode: lastElement.firstMode,
                    playerName: lastElement.playerName,
                    secondMode: lastElement.secondMode,
                    score: lastElement.score,
                });
            }
        }
        return position + 1;
    }

    private async saveFirstModeStats(id: string, stats: FirstModeStats, firstMode: FirstGameMode) {
        for (const soloStat of stats.solo) {
            await this.databaseService.createStats({
                cardId: id,
                firstMode,
                secondMode: SecondGameMode.SOLO,
                playerName: soloStat.name,
                score: soloStat.score,
            } as PlayerStats);
        }
        for (const versusStat of stats.versus) {
            await this.databaseService.createStats({
                cardId: id,
                firstMode,
                secondMode: SecondGameMode.VERSUS,
                playerName: versusStat.name,
                score: versusStat.score,
            } as PlayerStats);
        }
    }

    private formatPlayerStats(playersStats: PlayerStats[], firstMode: FirstGameMode): SecondModeStats[] {
        const stats = new Array();
        for (const playerStats of playersStats) {
            stats.push({ name: playerStats.playerName, score: playerStats.score });
        }
        const sortByScore = (first: SecondModeStats, second: SecondModeStats) => {
            return firstMode === FirstGameMode.CLASSIC ? first.score - second.score : second.score - first.score;
        };
        return stats.sort(sortByScore);
    }

    private sortStatArray(array: PlayerStats[]) {
        return array.sort((a, b) => Number(a.score) - Number(b.score));
    }
}
