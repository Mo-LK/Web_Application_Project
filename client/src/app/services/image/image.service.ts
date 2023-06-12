import { Injectable } from '@angular/core';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { BackgroundImage } from '@app/interfaces/background-image';
import { Rectangle } from '@app/interfaces/rectangle';
import { BITS_PER_PIXELS, BMP_HEADER_VALIDATION, ERROR_MESSAGE_BMP, ERROR_MESSAGE_SIZE } from './image.service.constants';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    async isLoaded(file: File): Promise<HTMLImageElement> {
        const URL = window.webkitURL;
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;
        return new Promise((resolve) => {
            img.onload = () => resolve(img);
        });
    }

    async showPreview(input: HTMLInputElement): Promise<BackgroundImage> {
        if (!this.isInputValid(input)) {
            return { image: new Image(), message: 'erreur' } as BackgroundImage;
        }
        // Justification: We are sure that the file is not null. The function isInputValid() checks it.
        /* eslint-disable-next-line*/
        const file = input.files![0];
        const image = await this.isLoaded(file);
        const imagePosition = { width: image.width, height: image.height } as Rectangle;
        const imageBmpHeader = await this.getBmpHeader(file);
        const errorMessage = this.imageValidations(imagePosition, imageBmpHeader);
        return { image, message: errorMessage } as BackgroundImage;
    }

    isInputValid(input: HTMLInputElement): boolean {
        return input && input.files && input.files[0] ? true : false;
    }

    private isImageSizeValid(width: number, height: number): boolean {
        return width === DEFAULT_CANVAS_WIDTH && height === DEFAULT_CANVAS_HEIGHT;
    }

    private async getBmpHeader(file: File): Promise<DataView> {
        const imageBmpHeader = new DataView(await file.arrayBuffer());

        return Promise.resolve(imageBmpHeader);
    }

    private isImageBMP24(imageBmpHeader: DataView) {
        return imageBmpHeader.getUint16(BMP_HEADER_VALIDATION, true) === BITS_PER_PIXELS;
    }

    private imageValidations(region: Rectangle, imageBmpHeader: DataView): string {
        if (!this.isImageSizeValid(region.width, region.height)) {
            return ERROR_MESSAGE_SIZE;
        }

        if (!this.isImageBMP24(imageBmpHeader)) {
            return ERROR_MESSAGE_BMP;
        }

        return '';
    }
}
