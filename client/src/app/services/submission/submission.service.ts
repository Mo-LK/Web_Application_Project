import { Injectable } from '@angular/core';
import { STANDARD_CANVAS_HEIGHT, STANDARD_CANVAS_WIDTH } from '@app/components/card-creation/card-creation.component.constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { Card } from '@common/card';
import { CardIO } from '@common/card-io';
import { Message } from '@common/message';
import { Subject, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SubmissionService {
    cardIO: CardIO;
    finishedLoadingSubject: Subject<boolean>;
    private originalImageBase64: string;
    private modifiedImageBase64: string;
    private enlargementRadius: number;

    constructor(public communicationService: CommunicationService) {
        this.finishedLoadingSubject = new Subject<boolean>();
    }

    async differencesImage(originalImageBase64: string, modifiedImageBase64: string, enlargementRadius: number) {
        const metadata: Card = {} as Card;
        metadata.enlargementRadius = enlargementRadius;

        this.originalImageBase64 = originalImageBase64;
        this.modifiedImageBase64 = modifiedImageBase64;
        this.enlargementRadius = enlargementRadius;

        const cardIOClient: CardIO = {
            firstImage: originalImageBase64,
            secondImage: modifiedImageBase64,
            metadata,
        };

        const message: Message = {
            title: 'Cards',
            body: JSON.stringify(cardIOClient),
        };

        const req = await firstValueFrom(this.communicationService.postRequest('card/differences-image', message));

        if (req.body) {
            const responseMessage = JSON.parse(req.body) as Message;
            this.cardIO = (await JSON.parse(responseMessage.body)) as CardIO;
        }
    }

    async saveCard(title: string) {
        this.cardIO.firstImage = this.originalImageBase64;
        this.cardIO.secondImage = this.modifiedImageBase64;
        this.cardIO.metadata.enlargementRadius = this.enlargementRadius;
        this.cardIO.metadata.title = title;

        const message: Message = {
            title: 'Save card',
            body: JSON.stringify(this.cardIO),
        };
        const req = this.communicationService.postRequest('card', message);
        req.subscribe();
    }

    mergeImageAndDrawing(imageCanvas: HTMLCanvasElement, drawingCanvas: HTMLCanvasElement, hasDrawing: boolean): HTMLCanvasElement {
        const submitCanvas = document.createElement('canvas');
        submitCanvas.width = STANDARD_CANVAS_WIDTH;
        submitCanvas.height = STANDARD_CANVAS_HEIGHT;
        submitCanvas.classList.add('holder');

        const contextSubmit = submitCanvas.getContext('2d') as CanvasRenderingContext2D;
        contextSubmit.drawImage(imageCanvas, 0, 0);

        if (hasDrawing) {
            contextSubmit.drawImage(drawingCanvas, 0, 0);
        }

        return submitCanvas;
    }
}
