import { Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinates';
import { HEIGTH_SPACE as HEIGHT_SPACE, LEFT_MOUSE_BUTTON } from './mouse.service.constants';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mouseClickIsDisabled: boolean;
    mousePosition: Coordinate;

    constructor() {
        this.mouseClickIsDisabled = false;
        this.mousePosition = { x: 0, y: 0 };
    }

    mouseHitDetect(event: MouseEvent): Coordinate {
        if (event.button === LEFT_MOUSE_BUTTON && !this.mouseClickIsDisabled) {
            return { x: event.offsetX, y: event.offsetY };
        }
        return null as unknown as Coordinate;
    }

    toggleClick(isDisabled: boolean) {
        this.mouseClickIsDisabled = isDisabled;
    }

    getMousePositionOnCanvas(event: MouseEvent, leftBoundClientRect: number): Coordinate {
        const canvasTarget = event.target as HTMLCanvasElement;

        return {
            x: event.clientX - canvasTarget.offsetLeft - leftBoundClientRect,
            y: event.clientY - canvasTarget.offsetTop - HEIGHT_SPACE + document.documentElement.scrollTop,
        } as Coordinate;
    }
}
