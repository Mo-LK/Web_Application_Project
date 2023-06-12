import { CardStats } from './card-stats';
import { Coordinate } from './coordinates';

export class Card {
    enlargementRadius: number;
    differences: Coordinate[][];
    title: string;
    stats: CardStats;
    difficultyLevel: string;
    id: string;
}
