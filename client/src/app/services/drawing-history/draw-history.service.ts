import { Injectable } from '@angular/core';
import { CLEAR_TOOL_FUNCTION, MODIFIED, ORIGINAL } from '@app/components/card-drawing/card-drawing.component.constants';
import { DrawCommands } from '@app/interfaces/draw-commands';
import { END_OF_ARRAY } from '@app/services/drawing-tools/drawing-tools.service.constants';
import { Coordinate } from '@common/coordinates';

@Injectable({
    providedIn: 'root',
})
export class DrawHistoryService {
    pathHistory: DrawCommands[];
    lineHistoryCursor: number;

    constructor() {
        this.pathHistory = [];
        this.lineHistoryCursor = 0;
    }

    removeLastActionToCursor() {
        const tempArray: DrawCommands[] = [];

        let ajustement = 2;
        if (this.pathHistory[this.pathHistory.length - 1].functionName === CLEAR_TOOL_FUNCTION) {
            ajustement = 0;
        }

        for (let i = 0; i < this.lineHistoryCursor + ajustement; i++) {
            tempArray.push(this.pathHistory[i]);
        }
        tempArray.splice(END_OF_ARRAY, 1);
        tempArray.push(this.pathHistory[this.pathHistory.length - 1]);
        this.pathHistory = tempArray;
    }

    addDrawLineCommand(command: DrawCommands, points: Coordinate[]) {
        command.points = points;
        this.pathHistory.push(command);
    }

    addRectangleCommand(command: DrawCommands, startingPointX: number, startingPointY: number) {
        command.mouseStartPositionX = startingPointX;

        command.mouseStartPositionY = startingPointY;
        this.pathHistory.push(command);
    }

    switchDrawCommands(componentName: string) {
        const tempArray: DrawCommands[] = [];
        const otherComponentName = componentName === ORIGINAL ? MODIFIED : ORIGINAL;

        for (let i = 0; i < this.lineHistoryCursor + 1; i++) {
            if (this.pathHistory[i].componentName === componentName) {
                tempArray.push(this.copyDrawCommand(this.pathHistory[i], otherComponentName));
            }
        }
        this.addClearCanvasCommand(otherComponentName);
        this.pathHistory = this.pathHistory.concat(tempArray);

        this.lineHistoryCursor = this.pathHistory.length - 1;
    }

    addClearCanvasCommand(canvasName: string) {
        const command = {
            functionName: CLEAR_TOOL_FUNCTION,
            componentName: canvasName,
        } as DrawCommands;

        this.pathHistory.push(command);
        this.lineHistoryCursor = this.pathHistory.length - 1;
    }

    private copyDrawCommand(command: DrawCommands, otherComponentName: string): DrawCommands {
        const newDrawCommand = {
            functionName: command.functionName,
            mousePositionX: command.mousePositionX,
            mousePositionY: command.mousePositionY,
            size: command.size,
            color: command.color,
            componentName: otherComponentName,
            points: command.points,
            mouseStartPositionX: command.mouseStartPositionX,
            mouseStartPositionY: command.mouseStartPositionY,
            isSquare: command.isSquare,
        } as DrawCommands;

        return newDrawCommand;
    }
}
