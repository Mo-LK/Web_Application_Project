export const NUMBER_CARD_PER_PAGE = 4;
export interface GameParameters {
    isSolo: boolean;
    isClassic: boolean;
}

export const enum FirstGameMode {
    CLASSIC = 'classique',
    // Acceptable because we need this naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    LIMITED_TIME = 'Temps limité',
}

export const enum SecondGameMode {
    SOLO = 'solo',
    VERSUS = 'versus',
}
