import { Injectable } from '@angular/core';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { DrawCommands } from '@app/interfaces/draw-commands';

@Injectable({
    providedIn: 'root',
})
export class RectangleService {
    rectangleSettings(command: DrawCommands, context: CanvasRenderingContext2D): CanvasRenderingContext2D {
        context.globalCompositeOperation = 'source-over';

        if (!command.color) {
            context.fillStyle = 'black';
        }
        context.fillStyle = command.color;

        const rectWidth = command.mousePositionX - command.mouseStartPositionX;
        let rectHeight = command.mousePositionY - command.mouseStartPositionY;

        if (command.isSquare) {
            rectHeight = command.mousePositionX - command.mouseStartPositionX;
        }
        context.fillRect(command.mouseStartPositionX, command.mouseStartPositionY, rectWidth, rectHeight);
        return context;
    }

    printSquare(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate): CanvasRenderingContext2D {
        context.fillRect(
            cartesianCoordinate.previousPosition.x,
            cartesianCoordinate.previousPosition.y,
            cartesianCoordinate.currentPosition.x - cartesianCoordinate.previousPosition.x,
            cartesianCoordinate.currentPosition.x - cartesianCoordinate.previousPosition.x,
        );
        return context;
    }

    printRectangle(context: CanvasRenderingContext2D, cartesianCoordinate: CartesianCoordinate): CanvasRenderingContext2D {
        context.fillRect(
            cartesianCoordinate.previousPosition.x,
            cartesianCoordinate.previousPosition.y,
            cartesianCoordinate.currentPosition.x - cartesianCoordinate.previousPosition.x,
            cartesianCoordinate.currentPosition.y - cartesianCoordinate.previousPosition.y,
        );
        return context;
    }
}
