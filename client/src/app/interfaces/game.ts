import { Coordinate } from '@common/coordinates';

export interface Game {
    id: string;
    gameTitle: string;
    firstMode: string;
    secondMode: string;
    difficulty: string;
    differences: Coordinate[][];
    differencesBackup: Coordinate[][];
}
