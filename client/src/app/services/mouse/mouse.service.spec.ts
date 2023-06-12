/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Coordinate } from '@common/coordinates';
import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MouseService],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseHitDetect should return null when is not a left click', () => {
        const expectedPosition: Coordinate = { x: 0, y: 0 };
        const mouseEvent = {
            offsetX: expectedPosition.x + 10,
            offsetY: expectedPosition.y + 10,
            button: 1,
        } as MouseEvent;

        const returnValue = service.mouseHitDetect(mouseEvent);
        expect(returnValue).toBe(null as unknown as Coordinate);
    });

    it('mouseHitDetect should return correct position when is a left click', () => {
        const mouseEvent = {
            offsetX: 10,
            offsetY: 10,
            button: 0,
        } as MouseEvent;

        const returnValue = service.mouseHitDetect(mouseEvent);
        expect(returnValue).toEqual({ x: 10, y: 10 });
    });

    it('toggleClick should set mouseClickIsDisabled', () => {
        service.toggleClick(true);
        expect(service.mouseClickIsDisabled).toEqual(true);
        service.toggleClick(false);
        expect(service.mouseClickIsDisabled).toEqual(false);
    });

    it('getMousePositionOnCanvas should return correct position', () => {
        const mouseEvent = {
            offsetX: 10,
            offsetY: 10,
            clientX: 10,
            clientY: 10,
        } as MouseEvent;
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        // @ts-ignore
        mouseEvent.target = canvas;

        const returnValue = service.getMousePositionOnCanvas(mouseEvent, 5);
        expect(returnValue.x).toEqual(5);
    });
});
