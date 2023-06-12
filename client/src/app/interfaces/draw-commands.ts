import { Coordinate } from '@common/coordinates';

export interface DrawCommands {
    functionName: string;
    mousePositionX: number;
    mousePositionY: number;
    mouseStartPositionX: number;
    mouseStartPositionY: number;
    size: number;
    color: string;
    componentName: string;
    points: Coordinate[];
    isSquare: boolean;
}
