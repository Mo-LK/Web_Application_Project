export interface GameHistory {
    dateStarted: string;
    timeStarted: string;
    timeLength: string;
    gameType: string;
    firstPlayer: string;
    secondPlayer: string;
    winnerSocketId: string;
    surrender: boolean;
    firstPlayerSocketId: string;
    secondPlayerSocketId: string;
    surrenderSocketId: string;
}
