import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';

export enum ViewMode {
    CLASSIC = 0,
    CONFIGURATION = 1,
}

export const DEFAULT_CARD = {
    title: '',
    stats: {} as CardStats,
    difficultyLevel: '',
} as Card;
