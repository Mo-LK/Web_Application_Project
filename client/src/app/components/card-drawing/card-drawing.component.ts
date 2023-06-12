import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CartesianCoordinate } from '@app/interfaces/cartesian-coordinate';
import { RectangleService } from '@app/services/draw-rectangle/draw-rectangle.service';
import { DrawingToolsService } from '@app/services/drawing-tools/drawing-tools.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { Coordinate } from '@common/coordinates';
import { ERASE_TOOL_FUNCTION, PENCIL_TOOL_FUNCTION, RECTANGLE_TOOL_FUNCTION } from './card-drawing.component.constants';

@Component({
    selector: 'app-card-drawing',
    templateUrl: './card-drawing.component.html',
    styleUrls: ['./card-drawing.component.scss'],
})
export class CardDrawingComponent implements AfterViewInit {
    @ViewChild('canvasDrawing') canvasDrawingRef: ElementRef<HTMLCanvasElement>;
    @Input() name: string;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    private mousePosition: Coordinate;
    private previousPosition: Coordinate;
    private points: Coordinate[];
    private isPainting: boolean;

    constructor(public drawingService: DrawingToolsService, private rectangleService: RectangleService, private mouseService: MouseService) {}

    @HostListener('window:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent) {
        if (event.shiftKey && this.drawingService.tool === RECTANGLE_TOOL_FUNCTION && this.isPainting) {
            const cartesianCoordinate: CartesianCoordinate = {
                componentName: this.name,
                currentPosition: this.mousePosition,
                previousPosition: this.previousPosition,
            };
            this.context = this.rectangleService.printSquare(this.context, cartesianCoordinate);
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent) {
        if (!event.shiftKey && this.drawingService.tool === RECTANGLE_TOOL_FUNCTION && this.isPainting) {
            this.context = this.drawingService.clearCanvasForRefresh(this.context, this.name);
            const cartesianCoordinate: CartesianCoordinate = {
                componentName: this.name,
                currentPosition: this.mousePosition,
                previousPosition: this.previousPosition,
            };
            this.context = this.rectangleService.printRectangle(this.context, cartesianCoordinate);
        }
    }

    ngAfterViewInit(): void {
        this.canvas = this.canvasDrawingRef.nativeElement;
        this.context = this.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.context = this.drawingService.initializeContext(this.context);
        this.drawingService.tool = PENCIL_TOOL_FUNCTION;
        this.drawingService.drawHistoryService.pathHistory = [];
        this.drawingService.drawHistoryService.lineHistoryCursor = 0;
        this.actionClearCanvas();
    }

    activate(event: MouseEvent) {
        this.isPainting = true;
        this.drawingService.nameLastAction = this.name;
        this.setInitialToolPosition(event);

        this.draw(event);
    }

    draw(event: MouseEvent) {
        if (!this.isPainting) return;

        this.setNextToolPosition(event);

        const cartesianCoordinate = {
            previousPosition: this.previousPosition,
            currentPosition: this.mousePosition,
            componentName: this.name,
        } as CartesianCoordinate;

        this.context = this.drawingService.draw(this.context, cartesianCoordinate, event.shiftKey);
    }

    deactivate() {
        if (this.drawingService.nameLastAction !== this.name || !this.isPainting) {
            return;
        }
        this.isPainting = false;
        this.context = this.drawingService.saveDrawing(this.context, this.points, this.previousPosition);
    }

    actionClearCanvas() {
        this.context = this.drawingService.clearCanvas(this.context);
        this.drawingService.drawHistoryService.addClearCanvasCommand(this.name);
        this.drawingService.repositionLastAction();
    }

    hasDrawing(): boolean {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.some((channel) => channel !== 0);
    }

    private initializePosition(event: MouseEvent) {
        this.mousePosition = this.mouseService.getMousePositionOnCanvas(event, this.canvas.getBoundingClientRect().left);
        this.previousPosition = { x: this.mousePosition.x, y: this.mousePosition.y };
        this.mousePosition = this.mouseService.getMousePositionOnCanvas(event, this.canvas.getBoundingClientRect().left);
        this.points = [];
        this.points.push(this.previousPosition);
    }

    private pushCoordinate(event: MouseEvent) {
        this.previousPosition = { x: this.mousePosition.x, y: this.mousePosition.y };
        this.mousePosition = this.mouseService.getMousePositionOnCanvas(event, this.canvas.getBoundingClientRect().left);
        this.points.push(this.mousePosition);
    }

    private setInitialToolPosition(event: MouseEvent) {
        if (this.drawingService.tool === PENCIL_TOOL_FUNCTION || this.drawingService.tool === ERASE_TOOL_FUNCTION) {
            this.initializePosition(event);
        } else if (this.drawingService.tool === RECTANGLE_TOOL_FUNCTION) {
            this.mousePosition = this.mouseService.getMousePositionOnCanvas(event, this.canvas.getBoundingClientRect().left);
            this.previousPosition = { x: this.mousePosition.x, y: this.mousePosition.y } as Coordinate;
        }
    }

    private setNextToolPosition(event: MouseEvent) {
        if (this.drawingService.tool === PENCIL_TOOL_FUNCTION || this.drawingService.tool === ERASE_TOOL_FUNCTION) {
            this.pushCoordinate(event);
        } else {
            this.mousePosition = this.mouseService.getMousePositionOnCanvas(event, this.canvas.getBoundingClientRect().left);
        }

        this.drawingService.assignInitialCommand(this.name, this.mousePosition.x, this.mousePosition.y);
    }
}
