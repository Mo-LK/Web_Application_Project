import { Coordinate } from '@common/coordinates';

export interface CartesianCoordinate {
    previousPosition: Coordinate;
    currentPosition: Coordinate;
    componentName: string;
}
