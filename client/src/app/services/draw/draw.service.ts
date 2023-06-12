import { Injectable } from '@angular/core';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { BOTTOM_RIGHT_INDEX, TOP_LEFT_INDEX } from '@app/services/game-clues/game-clues.service.constants';
import { Coordinate } from '@common/coordinates';
import { DASHED_LINE_WIDTH, GAP_WIDTH, LINE_WIDTH, RBGA_MAX_VALUE, RGBA_PARAM_NUMBER, STROKE_COLOR } from './draw.service.constants';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    contextOriginal: CanvasRenderingContext2D;
    contextModified: CanvasRenderingContext2D;
    private canvasSize: Coordinate;
    private imageOriginal;
    private imageModified;
    private imageOriginalSave;
    private imageModificationSave;
    private quadrantCorners: Coordinate[];

    constructor() {
        this.canvasSize = { x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT };
        this.imageOriginal = new Image();
        this.imageModified = new Image();
        this.imageOriginalSave = new Image();
        this.imageModificationSave = new Image();
    }

    get corners() {
        return this.quadrantCorners;
    }

    async drawImage(imageSrc: string, isOriginal: boolean) {
        const image = isOriginal ? this.imageOriginal : this.imageModified;
        const imageSave = isOriginal ? this.imageOriginalSave : this.imageModificationSave;
        const context = isOriginal ? this.contextOriginal : this.contextModified;
        image.src = imageSrc;
        imageSave.src = imageSrc;
        image.crossOrigin = 'Anonymous';
        imageSave.crossOrigin = 'Anonymous';
        return new Promise<void>((done) => {
            image.onload = async () => {
                context.drawImage(image, 0, 0);
                return done();
            };
        });
    }

    setYellowSpot(pixelArr: Coordinate[]) {
        const imgDataModified = this.contextModified.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
        const imgDataOriginal = this.contextOriginal.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
        const dataModified = imgDataModified.data;
        const dataOriginal = imgDataOriginal.data;

        pixelArr.forEach((vector) => {
            const index = vector.y * (this.canvasSize.x * RGBA_PARAM_NUMBER) + vector.x * RGBA_PARAM_NUMBER;
            dataModified[index] = RBGA_MAX_VALUE;
            dataModified[index + 1] = RBGA_MAX_VALUE;
            dataModified[index + 2] = 0;
            dataOriginal[index] = RBGA_MAX_VALUE;
            dataOriginal[index + 1] = RBGA_MAX_VALUE;
            dataOriginal[index + 2] = 0;
        });
        this.contextOriginal.putImageData(imgDataOriginal, 0, 0);
        this.contextModified.putImageData(imgDataModified, 0, 0);
    }

    resetImages(pixelArr: Coordinate[]) {
        this.contextOriginal.drawImage(this.imageOriginalSave, 0, 0);
        const originalData = this.contextOriginal.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y).data;
        const modifiedImg = this.contextModified.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
        pixelArr.forEach((vector) => {
            const position = vector.y * (this.canvasSize.x * RGBA_PARAM_NUMBER) + vector.x * RGBA_PARAM_NUMBER;
            for (let i = 0; i < RGBA_PARAM_NUMBER - 1; i++) {
                modifiedImg.data[position + i] = originalData[position + i];
            }
        });
        this.contextModified.putImageData(modifiedImg, 0, 0);
    }

    resetModifiedImageToInitialState() {
        this.contextModified.drawImage(this.imageModificationSave, 0, 0);
    }

    resetOriginalImageToInitialState() {
        this.contextOriginal.drawImage(this.imageOriginalSave, 0, 0);
    }

    drawQuadrant(corners: Coordinate[]) {
        if (corners) {
            this.quadrantCorners = corners;
            const topLeft = corners[TOP_LEFT_INDEX];
            const bottomRight = corners[BOTTOM_RIGHT_INDEX];
            this.contextModified.setLineDash([DASHED_LINE_WIDTH, GAP_WIDTH]);
            this.contextModified.strokeStyle = STROKE_COLOR;
            this.contextModified.beginPath();
            this.contextModified.lineWidth = LINE_WIDTH;
            this.contextModified.moveTo(topLeft.x, topLeft.y);
            this.contextModified.lineTo(bottomRight.x, topLeft.y);
            this.contextModified.lineTo(bottomRight.x, bottomRight.y);
            this.contextModified.lineTo(topLeft.x, bottomRight.y);
            this.contextModified.lineTo(topLeft.x, topLeft.y);
            this.contextModified.stroke();
        }
    }

    drawCircle(position: Coordinate, radius: number) {
        this.quadrantCorners = undefined as unknown as Coordinate[];
        this.contextModified.beginPath();
        this.contextModified.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
        this.contextModified.setLineDash([DASHED_LINE_WIDTH, GAP_WIDTH]);
        this.contextModified.strokeStyle = STROKE_COLOR;
        this.contextModified.lineWidth = LINE_WIDTH;
        this.contextModified.stroke();
    }
}
