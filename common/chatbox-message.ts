export interface ChatEntry {
    message: string;
    timestamp: string;
    type: ChatEntryType;
}

export enum ChatEntryType {
    USER = 0,
    EVENT = 1,
    GLOBAL = 2,
    SELF = 3,
    OPPONENT = 4,
}
