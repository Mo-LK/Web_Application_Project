import { Coordinate } from './coordinates';

export interface SuccessClick {
    socketId: string;
    differences: Coordinate[];
}