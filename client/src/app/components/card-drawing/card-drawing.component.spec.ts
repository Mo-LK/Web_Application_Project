/*eslint-disable*/
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardDrawingComponent } from './card-drawing.component';
import { ERASE_TOOL_FUNCTION, PENCIL_TOOL_FUNCTION, RECTANGLE_TOOL_FUNCTION } from './card-drawing.component.constants';

describe('CardDrawingComponent', () => {
    let component: CardDrawingComponent;
    let fixture: ComponentFixture<CardDrawingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardDrawingComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CardDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleKeyDownEvent should call printSquare', () => {
        component.drawingService.tool = 'drawRectangle';
        // @ts-ignore
        component.isPainting = true;
        const event = { key: 'a', shiftKey: true } as KeyboardEvent;
        // @ts-ignore
        const spy = spyOn(component.rectangleService, 'printSquare' as never).and.callFake(() => {});
        component.handleKeyDownEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('handleKeyDUpEvent should call printRectangle', () => {
        component.drawingService.tool = 'drawRectangle';
        // @ts-ignore
        component.isPainting = true;
        const event = { key: 'y', shiftKey: false } as KeyboardEvent;
        // @ts-ignore
        const spy = spyOn(component.rectangleService, 'printRectangle' as never).and.callFake(() => {});
        // @ts-ignore
        component.handleKeyUpEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('activate should call draw', () => {
        component.drawingService.tool = 'drawLine';
        spyOn(component, 'draw').and.callFake(() => {});
        // @ts-ignore
        spyOn(component, 'setInitialToolPosition' as never).and.callFake(() => {});
        const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        component.activate(event);
        expect(component.draw).toHaveBeenCalled();

    });

    it('draw should return nothing if isPainting is false', () => {
        // @ts-ignore
        component.isPainting = false;
        const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        const result = component.draw(event);
        expect(result).toBeUndefined();
    });

    it('draw should call setNextToolPosition if isPainting is false', () => {
        // @ts-ignore
        component.isPainting = true;
        const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        spyOn(component.drawingService, 'draw').and.callFake(() => {});
        // @ts-ignore
        const spy = spyOn(component, 'setNextToolPosition' as never).and.callFake(() => {});
        component.draw(event);
        expect(spy).toHaveBeenCalled();
    });

    it('deactivate should call saveDrawing', () => {
        component.drawingService.nameLastAction  = 'original';
        component.name = 'original';
        // @ts-ignore
        component.isPainting = true;
        // @ts-ignore
        const spy = spyOn(component.drawingService, 'saveDrawing' as never).and.callFake(() => {});
        component.deactivate();
        expect(spy).toHaveBeenCalled();
    });

    it('hasDrawing should verify if there is a drawing', () => {
        // @ts-ignore
        const valueBool = component.hasDrawing();
        expect(valueBool).toBeFalsy();
    });

    it('actionClearCanvas should call clearCanvas and repositionLastAction', () => {
        // @ts-ignore
        const spyRepositionLastAction = spyOn(component.drawingService, 'repositionLastAction' as never).and.callFake(() => {});
        // @ts-ignore
        const spyaddClearCanvasCommand = spyOn(component.drawingService.drawHistoryService, 'addClearCanvasCommand' as never).and.callFake(() => {});
        component.actionClearCanvas();
        expect(spyRepositionLastAction).toHaveBeenCalled();
        expect(spyaddClearCanvasCommand).toHaveBeenCalled();
    });

    it('initializePosition should call mouseService.getMousePositionOnCanvas', () => {
        // @ts-ignore
        const spy = spyOn(component.mouseService, 'getMousePositionOnCanvas').and.returnValue({ x: 0, y: 0 });
        // @ts-ignore
        component.initializePosition();
        expect(spy).toHaveBeenCalled();
    });

    it('pushCoordinate should call getMousePositionOnCanvas', () => {
        // @ts-ignore
        const spy = spyOn(component.mouseService, 'getMousePositionOnCanvas').and.returnValue({ x: 0, y: 0 });
        const mouseEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        component.mousePosition = { x: 0, y: 0 };
        // @ts-ignore
        component.points = [];
        // @ts-ignore
        component.pushCoordinate(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('setInitialToolPosition should call initializePosition if the tool is a pencil or eraser', () => {
        component.drawingService.tool = PENCIL_TOOL_FUNCTION;
        // @ts-ignore
        const spy = spyOn(component, 'initializePosition' as never).and.callFake(() => {});
        const mouseEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        component.setInitialToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();

        component.drawingService.tool = ERASE_TOOL_FUNCTION;
        // @ts-ignore
        component.setInitialToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });


    it('setInitialToolPosition should call getMousePositionOnCanvas if the tool rectangle', () => {
        // @ts-ignore
        const spy = spyOn(component.mouseService, 'getMousePositionOnCanvas').and.returnValue({ x: 0, y: 0 });
        component.drawingService.tool = RECTANGLE_TOOL_FUNCTION;
        const mouseEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        component.setInitialToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('setNextToolPosition should call pushCoordinate if the tool is a pencil or eraser', () => {
        component.drawingService.tool = PENCIL_TOOL_FUNCTION;
        // @ts-ignore
        const spy = spyOn(component, 'pushCoordinate' as never).and.callFake(() => {});
        const mouseEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        component.mousePosition = { x: 0, y: 0 };
        // @ts-ignore
        component.points = [];
        // @ts-ignore
        component.setNextToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();

        component.drawingService.tool = ERASE_TOOL_FUNCTION;
        // @ts-ignore
        component.setNextToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });


    it('setNextToolPosition should call getMousePositionOnCanvas if the tool rectangle', () => {
        // @ts-ignore
        const spy = spyOn(component.mouseService, 'getMousePositionOnCanvas').and.returnValue({ x: 0, y: 0 });
        component.drawingService.tool = RECTANGLE_TOOL_FUNCTION;
        const mouseEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
        // @ts-ignore
        component.setNextToolPosition(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

});
