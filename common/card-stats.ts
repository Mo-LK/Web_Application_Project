export class CardStats {
    classical: FirstModeStats
}

export interface FirstModeStats {
    solo: SecondModeStats[];
    versus: SecondModeStats[];
}

export interface SecondModeStats {
    name: string;
    score: number;
}
