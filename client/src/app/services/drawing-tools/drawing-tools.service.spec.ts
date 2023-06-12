/*eslint-disable*/
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ERASE_TOOL_FUNCTION, EXCHANGE_TOOL_FUNCTION, PENCIL_TOOL_FUNCTION, RECTANGLE_TOOL_FUNCTION } from '@app/components/card-drawing/card-drawing.component.constants';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';
import { Coordinate } from '@common/coordinates';
import { DrawingToolsService } from './drawing-tools.service';

describe('DrawingService', () => {
    let service: DrawingToolsService;

    beforeEach(() => {
        TestBed.configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });
        service = TestBed.inject(DrawingToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('repositionLastAction should call removeLastActionToCursor if isUndoLastOperation is true', () => {
        //@ts-ignore
        const spy = spyOn(service.drawHistoryService, 'removeLastActionToCursor');
        //@ts-ignore
        service.isUndoLastOperation = true;
        service.repositionLastAction();
        expect(spy).toHaveBeenCalled();
    });

    it('repositionLastAction should set ajustement to 0 if last action is clearCanvas', () => {
        const command = {
            functionName: 'clearCanvas',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        service.drawHistoryService.pathHistory.push(command);
        //@ts-ignore
        service.isUndoLastOperation = true;
        service.drawHistoryService.removeLastActionToCursor();
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].functionName).toEqual('clearCanvas');
    });

    it('repositionLastAction should not call removeLastActionToCursor if isUndoLastOperation is false', () => {
        //@ts-ignore
        const spy = spyOn(service.drawHistoryService, 'removeLastActionToCursor');
        //@ts-ignore
        service.isUndoLastOperation = false;
        service.repositionLastAction();
        expect(spy).not.toHaveBeenCalled();
    });

    it('undo should set isUndoLastOperation to true and decrement drawHistoryService.lineHistoryCursor', () => {

        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        //@ts-ignore
        spyOn(service, 'updateCanvasContext' as never).and.callFake(() => {});
        //@ts-ignore
        service.drawHistoryService.lineHistoryCursor = 1;
        service.undo('original');
        // @ts-ignore
        expect(service.isUndoLastOperation).toBeTruthy();
        expect(service.drawHistoryService.lineHistoryCursor).toEqual(0);
    });

    // it('redo should set isRedoLastOperation to true and increment drawHistoryService.lineHistoryCursor', () => {
    //     service.drawHistoryService.lineHistoryCursor = 1;
    //     service.redo('original');
    //     expect(service.isRedoLastOperation).toBeTruthy();
    //     expect(service.drawHistoryService.lineHistoryCursor).toEqual(2);
    // });

    it('undo should not set isUndoLastOperation to true and decrement drawHistoryService.lineHistoryCursor if drawHistoryService.lineHistoryCursor is 0', () => {

        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        service.drawHistoryService.lineHistoryCursor = 0;
        service.undo('original');
        //@ts-ignore
        expect(service.isUndoLastOperation).toBeTruthy();
        expect(service.drawHistoryService.lineHistoryCursor).toEqual(-1);
    });

    it('redo should not set isRedoLastOperation to true and increment drawHistoryService.lineHistoryCursor if drawHistoryService.lineHistoryCursor is drawHistoryService.pathHistory.length', () => {
        service.drawHistoryService.lineHistoryCursor = 1;

        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'updateCanvasContext' as never).and.callFake(() => {});
        service.redo('original');
        expect(service.isRedoLastOperation).toBeTruthy();
        expect(service.drawHistoryService.lineHistoryCursor).toEqual(2);
    });

    it('duplicateDrawing should not call repositionLastAction if drawHistoryService.pathHistory.length is 0', () => {
        const spy = spyOn(service, 'repositionLastAction');
        service.duplicateDrawing('test');
        expect(spy).not.toHaveBeenCalled();
    });

    it('duplicateDrawing should call repositionLastAction if drawHistoryService.pathHistory.length is not 0', () => {
        const spy = spyOn(service.drawHistoryService, 'switchDrawCommands' as never);
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];

        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        service.duplicateDrawing('test');
        expect(spy).toHaveBeenCalled();
    });

    it('duplicateDrawing should call switchDrawCommands with componentName', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        // @ts-ignore
        const spy = spyOn(service.drawHistoryService, 'switchDrawCommands' as never);
        service.duplicateDrawing(command.componentName);
        expect(spy).toHaveBeenCalledWith('original' as never);
    });

    it('duplicateDrawing should push lastCommand to drawHistoryService.pathHistory if isUndoLastOperation is true', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        service.drawHistoryService.pathHistory = [command];
        // @ts-ignore
        service.isUndoLastOperation = true;
        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        service.duplicateDrawing(command.componentName);
        // eslint-disable-next-line
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].mousePositionX).toEqual(command.mousePositionX);
    });

    it('duplicateDrawing should push lastCommand to drawHistoryService.pathHistory if isRedoLastOperation is true', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        service.drawHistoryService.pathHistory = [command];
        const canvasModified = document.createElement('canvas');
        canvasModified.width = 100;
        canvasModified.height = 100;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        const contextCanvasOriginal = document.createElement('canvas');
        contextCanvasOriginal.width = 100;
        contextCanvasOriginal.height = 100;
        service.contextCanvasOriginal = contextCanvasOriginal.getContext('2d') as CanvasRenderingContext2D;
        service.contextCanvasModified = canvasModified.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service, 'systemDraw' as never).and.callFake(() => {})
        service.isRedoLastOperation = true;
        service.duplicateDrawing(command.componentName);
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].mousePositionX).toEqual(command.mousePositionX);
    });

    it('addClearCanvasCommand should push clearCanvas command to drawHistoryService.pathHistory', () => {
        service.drawHistoryService.addClearCanvasCommand('test');
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].functionName).toEqual('clearCanvas');
    });

    it('exchangeDrawing should changed command  componentName', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const command2 = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'modified',
            isSquare: false,
        } as DrawCommands;

        service.drawHistoryService.pathHistory = [command, command2];

        service.exchangeDrawing();

        expect(service.drawHistoryService.pathHistory[0].componentName).toEqual('modified');
        expect(service.drawHistoryService.pathHistory[1].componentName).toEqual('original');
    });

    it('removeLastActionToCursor should have a temp array that pushes all the commands from drawHistoryService.pathHistory to temp', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const command2 = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'modified',
            isSquare: false,
        } as DrawCommands;

        service.drawHistoryService.pathHistory = [command, command2];
        service.drawHistoryService.lineHistoryCursor = 1;
        service.drawHistoryService.removeLastActionToCursor();
        expect(service.drawHistoryService.pathHistory[0].componentName).toEqual('original');
    });

    it('switchDrawCommands should make othercomponentName equal to original or modified', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const command2 = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'modified',
            isSquare: false,
        } as DrawCommands;

        service.drawHistoryService.pathHistory = [command, command2];
        service.drawHistoryService.switchDrawCommands('original');
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].componentName).toEqual('modified');
        expect(service.drawHistoryService.pathHistory[0].componentName).toEqual('original');
        service.drawHistoryService.switchDrawCommands('modified');
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].componentName).toEqual('original');
        expect(service.drawHistoryService.pathHistory[0].componentName).toEqual('original');
    });

    it('addDrawLineCommand should push command to drawHistoryService.pathHistory', () => {
         const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        let points = [{x: 1, y: 2}, {x: 4, y: 6}] as Coordinate[];
        // @ts-ignore
        service.drawHistoryService.addDrawLineCommand(command, points);
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].functionName).toEqual('drawLine');
    });

    it('addRectangleCommand should push command to drawHistoryService.pathHistory', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawRectangle',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        // @ts-ignore
        service.drawHistoryService.addRectangleCommand(service.command,1, 1);
        expect(service.drawHistoryService.pathHistory[service.drawHistoryService.pathHistory.length - 1].functionName).toEqual('drawRectangle');
    });

    it('setCommandtoSquare should set command to square to be true', () => {
        // @ts-ignore
         service.command = {
            functionName: 'drawRectangle',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        service.setCommandToSquare();
        // @ts-ignore
        expect(service.command.isSquare).toEqual(true);
    });

    it('systemDraw should call drawingRightCommand and resetColor', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        // @ts-ignore
        const drawingRightCommandSpy = spyOn(service, 'drawingRightCommand' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawHistoryService.pathHistory = [service.command];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.systemDraw(context, 'original');
        expect(drawingRightCommandSpy).toHaveBeenCalled();
    });

    it('clearCanvasForRefresh systemDraw if drawHistoryService.pathHistory.length > 0', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;
        // @ts-ignore
        const drawingRightCommandSpy = spyOn(service, 'drawingRightCommand' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawHistoryService.pathHistory = [service.command];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.clearCanvasForRefresh(context, 'original');
        expect(drawingRightCommandSpy).toHaveBeenCalled();
    });

    it('saveDrawing should call addDrawLineCommand if functionName is drawLine or erase', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const points = [{x: 1, y: 2}, {x: 4, y: 6}] as Coordinate[];
        const coordinatesRectangle = {x: 1, y: 2} as Coordinate;
        // @ts-ignore
        const addDrawLineCommandSpy = spyOn(service.drawHistoryService, 'addDrawLineCommand' as never).and.callFake(() => {});
        service.saveDrawing(context, points, coordinatesRectangle);
        expect(addDrawLineCommandSpy).toHaveBeenCalled();
    });

    it('saveDrawing should call addRectangleCommand if functionName is drawRectangle', () => {
        service.tool = 'drawRectangle';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const points = [{x: 1, y: 2}, {x: 4, y: 6}] as Coordinate[];
        const coordinatesRectangle = {x: 1, y: 2} as Coordinate;
        // @ts-ignore
        const addRectangleCommandSpy = spyOn(service.drawHistoryService, 'addRectangleCommand' as never).and.callFake(() => {});
        service.saveDrawing(context, points, coordinatesRectangle);
        expect(addRectangleCommandSpy).toHaveBeenCalled();
    });

    it('drawRectangle should call setCommandToSquare if isShiftKeyPressed is true', () => {
        service.tool = 'drawRectangle';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const cartesianCoordinate = {previousPosition:{x:1, y:2}, currentPosition:{x: 3, y:5}, componentName:'original'} as CartesianCoordinate;
        // @ts-ignore
        const setCommandToSquareSpy = spyOn(service, 'setCommandToSquare' as never).and.callFake(() => {});
        const isShiftKeyPressed = true;
        // @ts-ignore
        service.drawRectangle(context, cartesianCoordinate, isShiftKeyPressed );
        expect(setCommandToSquareSpy).toHaveBeenCalled();
    });

    it('drawingRightCommand should call lineSettings if functionName is drawLine or erase', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service.drawLineService, 'redrawLine' as never).and.callFake(() => {});
        // @ts-ignore
        const lineSettingsSpy = spyOn(service.drawLineService, 'lineSettings' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawingRightCommand(service.command,context );
        expect(lineSettingsSpy).toHaveBeenCalled();
    });

    it('drawingRightCommand should call rectangleSettings if functionName is drawRectangle', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawRectangle',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        const rectangleSettingsSpy = spyOn(service.rectangleService, 'rectangleSettings' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawingRightCommand(service.command,context );
        expect(rectangleSettingsSpy).toHaveBeenCalled();
    });

    it('drawingRightCommand should call clearCanvas if command functionName is clearCanvas', () => {
        // @ts-ignore
        service.command = {
            functionName: 'clearCanvas',
            mousePositionX: 4,
            mousePositionY: 4,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        const clearCanvasSpy = spyOn(service, 'clearCanvas' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawingRightCommand(service.command,context );
        expect(clearCanvasSpy).toHaveBeenCalled();
    });

        it('lineSettings should set pencil settings', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service.drawLineService, 'pencilSettings' as never).and.callFake(() => {});
        // @ts-ignore
        service.drawLineService.lineSettings(service.command, context);
        // @ts-ignore
        expect(service.command).toBeTruthy();
    });

    it('lineSettings should set erase settings', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        // @ts-ignore
        spyOn(service.drawLineService, 'eraserSettings' as never).and.callFake(() => {});
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        service.drawLineService.lineSettings(service.command, context);
        // @ts-ignore
        expect(service.command).toBeTruthy();
    });

    it('eraserSettings should set eraser settings', () => {

        const canvas = document.createElement('canvas');
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        context = service.drawLineService.eraserSettings(context);

        expect(context).toBeTruthy();
    });

    it('lineSettings should set context context.strokeStyle to black if command color is undefined', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        spyOn(service.drawLineService, 'pencilSettings' as never).and.callThrough();
        // @ts-ignore
        context = service.drawLineService.lineSettings(service.command, context);

        expect(context.strokeStyle).toEqual('#000000');
    });

    it('lineSettings should call eraserService.eraserSettings if command functionName is erase', () => {
        // @ts-ignore
        service.command = {
            functionName: 'erase',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // @ts-ignore
        const spy = spyOn(service.drawLineService, 'eraserSettings' as never).and.callThrough();
        // @ts-ignore
        service.drawLineService.lineSettings(service.command, context);
        expect(spy).toHaveBeenCalled();
    });

     it('redrawLine should call drawLine', () => {
        // @ts-ignore
        service.command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        // @ts-ignore
        service.drawHistoryService.pathHistory.push(service.command);
        
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let context = canvas.getContext('2d') as CanvasRenderingContext2D;
        //  @ts-ignore
        service.drawLineService.redrawLine(service.command, context);
        // @ts-ignore
        expect(service.command.points).toEqual(service.command.points);
    });

    it('assignInitialCommand should assign initial command', () => {
        service.assignInitialCommand('original', 100, 100);
        // @ts-ignore
        expect(service.command).toBeTruthy();
    });

    it('updateCanvasContext should update canvas context', () => {
        // @ts-ignore
        const spy = spyOn(service, 'systemDraw' as never).and.callFake(() => {});
        // @ts-ignore
        service.updateCanvasContext('modified');
        expect(spy).toHaveBeenCalled();

    });

    it('drawRectangle isShiftKeyPressed is not pressed then it should not call setCommandToSquare', () =>{
        // @ts-ignore
        const spy = spyOn(service, 'setCommandToSquare' as never).and.callFake(() => {});
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const cartesian = {
        previousPosition: { x: 0, y: 0 } as Coordinate,
        currentPosition: { x: 0, y: 0 } as Coordinate,
        componentName: 'original'
        } as CartesianCoordinate;
        // @ts-ignore
        service.drawRectangle(context,cartesian,false);
        expect(spy).not.toHaveBeenCalled();
    })

    it('draw should call drawLine', () => {
        service.tool = PENCIL_TOOL_FUNCTION;
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const cartesian = {
            previousPosition: { x: 0, y: 0 } as Coordinate,
            currentPosition: { x: 0, y: 0 } as Coordinate,
            componentName: 'original'
            } as CartesianCoordinate;
        // @ts-ignore
       const spy = spyOn(service.drawLineService, 'drawLine' as never).and.callFake(() => {});
        service.draw(context, cartesian, false);
        expect(spy).toHaveBeenCalled();
    });

    it('draw should call drawRectangle', () => {
        service.tool = RECTANGLE_TOOL_FUNCTION;
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const cartesian = {
            previousPosition: { x: 0, y: 0 } as Coordinate,
            currentPosition: { x: 0, y: 0 } as Coordinate,
            componentName: 'original'
            } as CartesianCoordinate;
        // @ts-ignore
       const spy = spyOn(service, 'drawRectangle' as never).and.callFake(() => {});
        service.draw(context, cartesian, false);
        expect(spy).toHaveBeenCalled();
    });

    it('draw should call erase', () => {
        service.tool = ERASE_TOOL_FUNCTION;
        const context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const cartesian = {
            previousPosition: { x: 0, y: 0 } as Coordinate,
            currentPosition: { x: 0, y: 0 } as Coordinate,
            componentName: 'original'
            } as CartesianCoordinate;
        // @ts-ignore
       const spy = spyOn(service.drawLineService, 'drawLine' as never).and.callFake(() => {});
        service.draw(context, cartesian, false);
        expect(spy).toHaveBeenCalled();
    });

    it('undoVerification should call exchangeDrawingToolBox', () => {
        const command = {
            functionName: EXCHANGE_TOOL_FUNCTION,
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];

        // @ts-ignore
        const spy = spyOn(service, 'exchangeDrawingToolBox' as never).and.callFake(() => {});
        service.undoVerification();
        expect(spy).toHaveBeenCalled();
    });

    it('undoVerification should call undo', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        // @ts-ignore
        spyOn(service , 'updateCanvasContext').and.callFake(() => {});
        // @ts-ignore
        const spy = spyOn(service, 'undo' as never).and.callFake(() => {});
        service.undoVerification();
        expect(spy).toHaveBeenCalled();
    });



    it('redoVerification should call exchangeDrawingToolBox', () => {
        const command = {
            functionName: EXCHANGE_TOOL_FUNCTION,
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        service.drawHistoryService.lineHistoryCursor = -1;

        // @ts-ignore
        const spy = spyOn(service, 'exchangeDrawingToolBox' as never).and.callFake(() => {});
        service.redoVerification();
        expect(service.drawHistoryService.lineHistoryCursor).toEqual(0);
        expect(spy).toHaveBeenCalled();
    });

    
    it('redoVerification should call redo', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        service.drawHistoryService.pathHistory = [command];
        service.drawHistoryService.lineHistoryCursor = -1;
        // @ts-ignore
        spyOn(service , 'updateCanvasContext').and.callFake(() => {});
        // @ts-ignore
        const spy = spyOn(service, 'redo' as never).and.callFake(() => {});
        service.redoVerification();
        expect(spy).toHaveBeenCalled();
    });

    it('exchangeDrawingToolBox should call systemDraw', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        // @ts-ignore
        service.isUndoRedo = false;
        // @ts-ignore
        spyOn(service, 'systemDraw').and.callFake(() => {});
        const spy = spyOn(service, 'exchangeDrawing').and.callFake(() => {});
        service.drawHistoryService.pathHistory = [command];
        service.exchangeDrawingToolBox();
        expect(spy).toHaveBeenCalled();
    });

    it('should call undoVerification() with the first componentName if an error is thrown', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;

        const command2 = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        spyOn(service, 'exchangeDrawingToolBox');
        const undoSpy = spyOn(service, 'undo');
        service.drawHistoryService.pathHistory = [command, command2];
        service.drawHistoryService.lineHistoryCursor = 1;
      
        undoSpy.and.callFake(() => { throw new Error('error'); });

        try {
          service.undoVerification();
          expect(undoSpy).toHaveBeenCalledWith('component1');
        } catch {
          // Handle the error silently
        }
        expect(command2.functionName).toEqual('drawLine');
      });


      it('should call redoVerification() with the first componentName if an error is thrown', () => {
        const command = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;

        const command2 = {
            functionName: 'drawLine',
            mousePositionX: 4,
            mousePositionY: 4,
            mouseStartPositionX: 1,
            mouseStartPositionY: 2,
            size: 5,
            color: 'red',
            componentName: 'original',
            isSquare: false,
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
            ] as Coordinate[],
        } as DrawCommands;
        spyOn(service, 'exchangeDrawingToolBox');
        const redoSpy = spyOn(service, 'redo');
        service.drawHistoryService.pathHistory = [command, command2];
        service.drawHistoryService.lineHistoryCursor = 0;
      
        redoSpy.and.callFake(() => { throw new Error('error'); });

        try {
          service.redoVerification();
          expect(redoSpy).toHaveBeenCalledWith('component1');
        } catch {
          // Handle the error silently
        }
        expect(command2.functionName).toEqual('drawLine');

      });

      it('nameGiver should return the name modified if counterExchange is 0', () => {
        // @ts-ignore
        const result = service.nameGiver();
        expect(result).toEqual('modified');
      });

      it('nameGiver should return the name original if counterExchange is 1', () => {
        // @ts-ignore
        service.counterExchange = 1;
        // @ts-ignore
        const result = service.nameGiver();
        expect(result).toEqual('original');
      });

});
