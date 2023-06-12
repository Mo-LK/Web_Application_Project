export const TIMER_INTERVAL = 500;
export const TIME_DIVIDE_FACTOR = 1000;

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
