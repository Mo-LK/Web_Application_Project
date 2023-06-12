import { Injectable } from '@angular/core';
import {
    CLEAR_TOOL_FUNCTION,
    ERASE_TOOL_FUNCTION,
    EXCHANGE_TOOL_FUNCTION,
    MODIFIED,
    ORIGINAL,
    PENCIL_TOOL_FUNCTION,
    RECTANGLE_TOOL_FUNCTION,
} from '@app/components/card-drawing/card-drawing.component.constants';
import { OUT_OF_ARRAY } from '@app/components/tool-box/tool-box.component.constants';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';
import { DrawLineService } from '@app/services/draw-line/draw-line.service';
import { RectangleService } from '@app/services/draw-rectangle/draw-rectangle.service';
import { DrawHistoryService } from '@app/services/drawing-history/draw-history.service';
import { Coordinate } from '@common/coordinates';
import { STANDARD_ERASER_SIZE, STANDARD_PENCIL_SIZE } from './drawing-tools.service.constants';

@Injectable({
    providedIn: 'root',
})
export class DrawingToolsService {
    color: string;
    tool: string;
    pencilSize: number;
    eraserSize: number;
    isRedoLastOperation: boolean;
    nameLastAction: string;
    contextCanvasOriginal: CanvasRenderingContext2D;
    contextCanvasModified: CanvasRenderingContext2D;
    private isUndoLastOperation: boolean;
    private command: DrawCommands;
    private isUndoRedo: boolean;
    private counterExchange: number;

    constructor(private rectangleService: RectangleService, private drawLineService: DrawLineService, public drawHistoryService: DrawHistoryService) {
        this.tool = PENCIL_TOOL_FUNCTION;
        this.isUndoLastOperation = false;
        this.pencilSize = STANDARD_PENCIL_SIZE;
        this.eraserSize = STANDARD_ERASER_SIZE;
        this.nameLastAction = '';
        this.isUndoRedo = false;
        this.counterExchange = 0;
    }

    repositionLastAction() {
        if (this.isUndoLastOperation) {
            this.drawHistoryService.removeLastActionToCursor();
        }
        this.isUndoLastOperation = false;
    }

    undo(componentName: string) {
        this.isUndoLastOperation = true;
        this.drawHistoryService.lineHistoryCursor--;
        this.updateCanvasContext(componentName);
    }

    redo(componentName: string) {
        this.isRedoLastOperation = true;
        this.drawHistoryService.lineHistoryCursor++;
        this.updateCanvasContext(componentName);
    }

    duplicateDrawing(componentName: string) {
        if (!this.drawHistoryService.pathHistory.length) {
            return;
        }

        this.drawHistoryService.switchDrawCommands(componentName);

        if (componentName === ORIGINAL) {
            this.contextCanvasModified = this.systemDraw(this.contextCanvasModified, componentName);
        } else {
            this.contextCanvasOriginal = this.systemDraw(this.contextCanvasOriginal, componentName);
        }
    }

    exchangeDrawing() {
        this.drawHistoryService.pathHistory.forEach((command) => (command.componentName = command.componentName === ORIGINAL ? MODIFIED : ORIGINAL));
    }

    assignInitialCommand(componentName: string, mousePositionX: number, mousePositionY: number) {
        const size = this.tool === PENCIL_TOOL_FUNCTION ? this.pencilSize : this.eraserSize;
        this.command = {
            functionName: this.tool,
            mousePositionX,
            mousePositionY,
            size,
            color: this.color,
            componentName,
            isSquare: false,
        } as DrawCommands;
    }

    setCommandToSquare() {
        this.command.isSquare = true;
    }

    initializeContext(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.strokeStyle = this.color;
        context.lineWidth = STANDARD_PENCIL_SIZE;
        context.lineCap = 'round';
        return context;
    }

    systemDraw(context: CanvasRenderingContext2D, componentName: string): CanvasRenderingContext2D {
        this.clearCanvas(context);
        context = this.drawLineService.pencilSettings(context);

        for (let i = 0; i < this.drawHistoryService.lineHistoryCursor + 1; i++) {
            const path = this.drawHistoryService.pathHistory[i];
            if (path.componentName === componentName) {
                this.drawingRightCommand(path, context);
            }
        }
        this.resetColor(context);
        return context;
    }

    clearCanvas(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        return context;
    }

    clearCanvasForRefresh(context: CanvasRenderingContext2D, componentName: string): CanvasRenderingContext2D {
        if (this.drawHistoryService.pathHistory.length > 0) {
            context = this.systemDraw(context, componentName);
        } else {
            context = this.clearCanvas(context);
        }

        return context;
    }

    saveDrawing(context: CanvasRenderingContext2D, points: Coordinate[], coordinatesRectangle: Coordinate) {
        if (this.tool === PENCIL_TOOL_FUNCTION || this.tool === ERASE_TOOL_FUNCTION) {
            this.drawHistoryService.addDrawLineCommand(this.command, points);
            context = this.printLine(context);
        } else if (this.tool === RECTANGLE_TOOL_FUNCTION) {
            this.drawHistoryService.addRectangleCommand(this.command, coordinatesRectangle.x, coordinatesRectangle.y);
            this.repositionLastAction();
        }

        this.drawHistoryService.lineHistoryCursor = this.drawHistoryService.pathHistory.length - 1;

        return context;
    }

    draw(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate, isShiftKeyPressed: boolean): CanvasRenderingContext2D {
        context.globalCompositeOperation = 'source-over';

        switch (this.tool) {
            case PENCIL_TOOL_FUNCTION: {
                context = this.drawLineService.drawLine(context, cartesianCoordinate, this.command);
                break;
            }
            case RECTANGLE_TOOL_FUNCTION: {
                context = this.drawRectangle(context, cartesianCoordinate, isShiftKeyPressed);
                break;
            }
            case ERASE_TOOL_FUNCTION: {
                context = this.drawLineService.drawLine(context, cartesianCoordinate, this.command);
                break;
            }
        }
        return context;
    }

    undoVerification() {
        this.isUndoRedo = true;

        if (this.drawHistoryService.lineHistoryCursor !== OUT_OF_ARRAY && this.drawHistoryService.pathHistory.length > 0) {
            if (this.drawHistoryService.pathHistory[this.drawHistoryService.lineHistoryCursor].functionName === EXCHANGE_TOOL_FUNCTION) {
                this.exchangeDrawingToolBox();
                this.drawHistoryService.lineHistoryCursor--;
            } else {
                try {
                    this.undo(this.drawHistoryService.pathHistory[this.drawHistoryService.lineHistoryCursor].componentName);
                } catch {
                    this.undo(this.drawHistoryService.pathHistory[0].componentName);
                }
            }
        }
        this.isUndoRedo = false;
    }

    redoVerification() {
        this.isUndoRedo = true;

        if (this.drawHistoryService.lineHistoryCursor + 1 < this.drawHistoryService.pathHistory.length) {
            if (this.drawHistoryService.pathHistory[this.drawHistoryService.lineHistoryCursor + 1].functionName === EXCHANGE_TOOL_FUNCTION) {
                this.exchangeDrawingToolBox();
                this.drawHistoryService.lineHistoryCursor++;
            } else {
                try {
                    this.redo(this.drawHistoryService.pathHistory[this.drawHistoryService.lineHistoryCursor + 1].componentName);
                } catch {
                    this.redo(this.drawHistoryService.pathHistory[0].componentName);
                }
            }
        }
        this.isUndoRedo = false;
    }

    exchangeDrawingToolBox() {
        if (this.drawHistoryService.pathHistory) {
            this.exchangeDrawing();

            if (!this.isUndoRedo) {
                const componentName = this.nameGiver();
                this.drawHistoryService.pathHistory.push({ functionName: EXCHANGE_TOOL_FUNCTION, componentName } as DrawCommands);
                this.drawHistoryService.lineHistoryCursor++;
            }
            this.contextCanvasOriginal = this.systemDraw(this.contextCanvasOriginal, 'original');
            this.contextCanvasModified = this.systemDraw(this.contextCanvasModified, 'modified');
        }
    }

    private nameGiver() {
        this.counterExchange++;
        return this.counterExchange % 2 === 0 ? 'original' : 'modified';
    }

    private preparingDrawingRectangle(context: CanvasRenderingContext2D, componentName: string): CanvasRenderingContext2D {
        context = this.clearCanvasForRefresh(context, componentName);
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = this.color;
        return context;
    }

    private drawRectangle(
        context: CanvasRenderingContext2D,
        cartesianCoordinate: CartesianCoordinate,
        isShiftKeyPressed: boolean,
    ): CanvasRenderingContext2D {
        context = this.preparingDrawingRectangle(context, cartesianCoordinate.componentName);

        if (isShiftKeyPressed) {
            this.setCommandToSquare();
            context = this.rectangleService.printSquare(context, cartesianCoordinate);
        } else {
            context = this.rectangleService.printRectangle(context, cartesianCoordinate);
        }
        return context;
    }

    private printLine(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.stroke();
        context.beginPath();
        this.repositionLastAction();
        return context;
    }

    private drawingRightCommand(command: DrawCommands, context: CanvasRenderingContext2D) {
        switch (command.functionName) {
            case PENCIL_TOOL_FUNCTION:
            case ERASE_TOOL_FUNCTION: {
                context = this.drawLineService.lineSettings(command, context);
                context = this.drawLineService.redrawLine(command, context);

                break;
            }
            case RECTANGLE_TOOL_FUNCTION: {
                context = this.rectangleService.rectangleSettings(command, context);

                break;
            }
            case CLEAR_TOOL_FUNCTION: {
                context = this.clearCanvas(context);

                break;
            }
        }
        return context;
    }

    private resetColor(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        return context;
    }

    private updateCanvasContext(componentName: string) {
        if (componentName === ORIGINAL) {
            this.contextCanvasOriginal = this.systemDraw(this.contextCanvasOriginal, componentName);
        } else {
            this.contextCanvasModified = this.systemDraw(this.contextCanvasModified, componentName);
        }
    }
}
