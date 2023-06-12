import { TestBed } from '@angular/core/testing';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';

import { RectangleService } from './draw-rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('rectangleSettings should set rectangle settings and square', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        const command = {
            functionName: 'drawRectangle',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: '#ff0000',
            componentName: 'original',
            isSquare: true,
        } as DrawCommands;

        context = service.rectangleSettings(command, context);
        expect(context.fillStyle).toEqual(command.color);
    });

    it('rectangleSettings should set rectangle settings and square', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;

        const command = {
            functionName: 'drawRectangle',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            componentName: 'original',
            isSquare: true,
        } as DrawCommands;

        context = service.rectangleSettings(command, context);
        expect(context.fillStyle).toEqual('#000000');
    });

    it('prinSquare should have draw a square', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const cartesianCoordinate = {
            previousPosition: { x: 1, y: 2 },
            currentPosition: { x: 1, y: 2 },
        } as CartesianCoordinate;
        context = service.printSquare(context, cartesianCoordinate);

        expect(context).toBeTruthy();
    });

    it('prinRectangle should have draw a rectangle', () => {
        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const cartesianCoordinate = {
            previousPosition: { x: 1, y: 2 },
            currentPosition: { x: 1, y: 2 },
        } as CartesianCoordinate;
        context = service.printRectangle(context, cartesianCoordinate);

        expect(context).toBeTruthy();
    });
});
