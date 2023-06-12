import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { Observable, of } from 'rxjs';
import { SubmissionService } from './submission.service';

describe('SubmissionService', () => {
    let service: SubmissionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(SubmissionService);
        TestBed.inject(HttpClientModule);
        TestBed.inject(HttpClient);
        TestBed.inject(HttpTestingController);
        TestBed.inject(CommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call communicationService postRequest', () => {
        const response = new Observable<HttpResponse<string>>();
        const postRequestSpy = spyOn(service.communicationService, 'postRequest').and.returnValue(response);
        service.differencesImage('test', 'test', 3);
        expect(postRequestSpy).toHaveBeenCalled();
    });

    it('should parse response body if present', async () => {
        const originalImage = 'originalImageBase64';
        const modifiedImage = 'modifiedImageBase64';
        const enlargementRadius = 10;
        const message = {
            title: 'Cards',
            body: JSON.stringify({
                firstImage: originalImage,
                secondImage: modifiedImage,
                metadata: { enlargementRadius },
            }),
        };
        spyOn(service.communicationService, 'postRequest').and.returnValue(
            of(
                new HttpResponse({
                    status: 200,
                    body: JSON.stringify({ title: 'responseTitle', body: JSON.stringify({ cardIO: message.body }) }),
                }),
            ),
        );

        await service.differencesImage(originalImage, modifiedImage, enlargementRadius);

        expect(service.communicationService.postRequest).toHaveBeenCalledWith('card/differences-image', message);
    });

    it('saveCard should call communicationService postRequest', () => {
        const response = new Observable<HttpResponse<string>>();
        const postRequestSpy = spyOn(service.communicationService, 'postRequest').and.returnValue(response);
        service.cardIO = {
            firstImage: 'Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABA',
            secondImage: '',
            metadata: {
                enlargementRadius: 15,
                differences: [
                    [
                        { x: 165, y: 182 },
                        { x: 166, y: 187 },
                    ],
                ],
                title: 'title2',
                difficultyLevel: 'difficile',
                id: '1739399414-5604969110-9155696849',
                stats: {
                    classical: {
                        solo: [
                            { name: 'Guakamel', score: 235 },
                            { name: 'GharibSidney', score: 501 },
                            { name: 'Bigboy87', score: 1041 },
                        ],
                        versus: [
                            { name: 'Mo-Lk', score: 453 },
                            { name: 'simb59', score: 829 },
                            { name: 'Antoine Soldati', score: 933 },
                        ],
                    },
                },
            },
        };
        service.saveCard('test');
        expect(postRequestSpy).toHaveBeenCalled();
    });

    it('mergeImageAndDrawing should return a canvas', () => {
        const canvasImage = document.createElement('canvas');
        const canvasDrawing = document.createElement('canvas');
        const hasDrawing = true;

        expect(service.mergeImageAndDrawing(canvasImage, canvasDrawing, hasDrawing)).toBeTruthy();
        expect(service.mergeImageAndDrawing(canvasImage, canvasDrawing, false)).toBeInstanceOf(HTMLCanvasElement);
    });
});
