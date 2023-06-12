import { Injectable } from '@angular/core';
import { ERASE_TOOL_FUNCTION, PENCIL_TOOL_FUNCTION } from '@app/components/card-drawing/card-drawing.component.constants';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';

@Injectable({
    providedIn: 'root',
})
export class DrawLineService {
    drawLine(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate, command: DrawCommands): CanvasRenderingContext2D {
        this.setDrawLineCommand(context, command);

        context.beginPath();
        context.moveTo(cartesianCoordinate.previousPosition.x, cartesianCoordinate.previousPosition.y);
        context.lineTo(cartesianCoordinate.currentPosition.x, cartesianCoordinate.currentPosition.y);
        context.stroke();
        return context;
    }

    setDrawLineCommand(context: CanvasRenderingContext2D, command: DrawCommands): CanvasRenderingContext2D {
        context.strokeStyle = command.color;
        context.lineCap = 'round';

        if (command.functionName === ERASE_TOOL_FUNCTION) {
            context.globalCompositeOperation = 'destination-out';
            context.lineCap = 'square';
        }
        context.lineWidth = command.size;
        return context;
    }

    pencilSettings(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.globalCompositeOperation = 'source-over';
        context.lineCap = 'round';
        return context;
    }

    eraserSettings(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.globalCompositeOperation = 'destination-out';
        context.lineCap = 'square';
        return context;
    }

    redrawLine(path: DrawCommands, context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.beginPath();
        context.moveTo(path.points[0].x, path.points[0].y);

        for (let j = 1; j < path.points.length; j++) {
            context.lineTo(path.points[j].x, path.points[j].y);
        }
        context.stroke();
        return context;
    }

    lineSettings(command: DrawCommands, context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.lineWidth = command.size;
        if (!command.color) {
            context.strokeStyle = 'black';
        } else {
            context.strokeStyle = command.color;
        }

        if (command.functionName === ERASE_TOOL_FUNCTION) {
            context = this.eraserSettings(context);
        } else if (command.functionName === PENCIL_TOOL_FUNCTION) {
            context = this.pencilSettings(context);
        }
        return context;
    }
}
