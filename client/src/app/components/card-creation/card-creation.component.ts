import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { ImageService } from '@app/services/image/image.service';
import { PATH_EMPTY_IMAGE, STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH } from './card-creation.component.constants';

@Component({
    selector: 'app-card-creation',
    templateUrl: './card-creation.component.html',
    styleUrls: ['../../pages/game-creation/game-creation.component.scss', './card-creation.component.scss'],
})
export class CardCreationComponent implements AfterViewInit, OnChanges {
    @ViewChild('canvasCard') canvasRef: ElementRef<HTMLCanvasElement>;
    @Input() image: HTMLImageElement;
    @Input() isOriginal: boolean;

    textErrorMessage: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    private emptyImage: HTMLImageElement;

    constructor(public imageService: ImageService) {
        this.isOriginal = true;
    }

    ngOnChanges() {
        if (this.image) {
            this.canvasUpdate(this.image);
        }
    }

    ngAfterViewInit(): void {
        this.canvas = this.canvasRef.nativeElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.emptyImage = new Image();
        this.emptyImage.src = PATH_EMPTY_IMAGE;
        this.emptyImage.onload = () => {
            this.canvasUpdate(this.emptyImage);
        };
    }

    clearCanvas() {
        this.canvasUpdate(this.emptyImage);
    }

    async displayImage(target: EventTarget | null) {
        const input = target as HTMLInputElement;

        const backgroundImage = this.imageService.showPreview(input);

        if ((await backgroundImage) && !(await backgroundImage).message) {
            this.canvasUpdate((await backgroundImage).image);
            this.textErrorMessage = (await backgroundImage).message;
        } else {
            this.textErrorMessage = (await backgroundImage).message;
        }

        input.value = '';
    }

    private canvasUpdate(image: HTMLImageElement) {
        this.canvas.width = STANDARD_CANVAS_WIDTH;
        this.canvas.height = STANDARD_CANVAS_HEIGHT;
        this.context.drawImage(image, 0, 0);
    }
}
