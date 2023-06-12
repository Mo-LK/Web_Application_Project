import { Component, HostListener } from '@angular/core';
import { ERASE_TOOL_FUNCTION, PENCIL_TOOL_FUNCTION, RECTANGLE_TOOL_FUNCTION } from '@app/components/card-drawing/card-drawing.component.constants';
import { DrawingToolsService } from '@app/services/drawing-tools/drawing-tools.service';
import { DEFAULT_COLOR, DEFAULT_ERASER_SIZE, DEFAULT_PENCIL_SIZE } from './tool-box.component.constants';

@Component({
    selector: 'app-tool-box',
    templateUrl: './tool-box.component.html',
    styleUrls: ['./tool-box.component.scss'],
})
export class ToolBoxComponent {
    functionDrawLine;
    functionDrawRectangle;
    functionErase;
    protected activeTool: string;
    protected selectedColor: string;
    protected pencilSize: number;
    protected eraserSize: number;

    constructor(public drawingService: DrawingToolsService) {
        this.functionDrawLine = PENCIL_TOOL_FUNCTION;
        this.functionDrawRectangle = RECTANGLE_TOOL_FUNCTION;
        this.functionErase = ERASE_TOOL_FUNCTION;
        this.activeTool = PENCIL_TOOL_FUNCTION;
        this.selectedColor = DEFAULT_COLOR;
        this.pencilSize = DEFAULT_PENCIL_SIZE;
        this.eraserSize = DEFAULT_ERASER_SIZE;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyBoardEvent(event: KeyboardEvent) {
        if ((event.key === 'z' || event.key === 'Z') && event.ctrlKey && event.shiftKey) {
            this.drawingService.redoVerification();
        } else if ((event.key === 'z' || event.key === 'Z') && event.ctrlKey) {
            this.drawingService.undoVerification();
        }
    }

    onColorChanged(): void {
        this.drawingService.color = this.selectedColor;
    }

    onToolChanged(tool: string) {
        this.drawingService.tool = tool;
        this.activeTool = tool;
    }

    onPencilSizeChanged(): void {
        this.drawingService.pencilSize = this.pencilSize;
    }

    onEraserSizeChanged(): void {
        this.drawingService.eraserSize = this.eraserSize;
    }
}
