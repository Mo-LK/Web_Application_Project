import { TestBed } from '@angular/core/testing';

import { ERASE_TOOL_FUNCTION } from '@app/components/card-drawing/card-drawing.component.constants';
import { DrawLineService } from './draw-line.service';

describe('DrawLineService', () => {
    let service: DrawLineService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawLineService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('pencilSettings should set pencil settings', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.pencilSettings(context);
        expect(context.lineCap).toEqual('round');
    });

    it('eraserSettings should set eraser settings', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.eraserSettings(context);
        expect(context.globalCompositeOperation).toEqual('destination-out');
    });

    it('drawLine should call setDrawLineCommand', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const spy = spyOn(service, 'setDrawLineCommand');
        service.drawLine(
            context,
            {
                previousPosition: { x: 0, y: 0 },
                currentPosition: { x: 0, y: 0 },
                componentName: '',
            },
            {
                functionName: '',
                size: 0,
                mousePositionX: 0,
                mousePositionY: 0,
                mouseStartPositionX: 0,
                mouseStartPositionY: 0,
                color: '',
                componentName: '',
                points: [],
                isSquare: false,
            },
        );
        expect(spy).toHaveBeenCalled();
    });

    it('setDrawLineCommand should set the context.lineWidth to command.size', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.setDrawLineCommand(context, {
            functionName: ERASE_TOOL_FUNCTION,
            size: 2,
            mousePositionX: 0,
            mousePositionY: 0,
            mouseStartPositionX: 0,
            mouseStartPositionY: 0,
            color: '',
            componentName: '',
            points: [],
            isSquare: false,
        });
        expect(context.lineWidth).toEqual(2);
    });
});
