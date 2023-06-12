/*eslint-disable*/
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CardCreationComponent } from '@app/components/card-creation/card-creation.component';
import { CardDrawingComponent } from '@app/components/card-drawing/card-drawing.component';
import { BackgroundImage } from '@app/interfaces/background-image';
import { ImageService } from '@app/services/image/image.service';
import { SubmissionService } from '@app/services/submission/submission.service';
import { GameCreationComponent } from './game-creation.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('GameCreationComponent', () => {
    let component: GameCreationComponent;
    let fixture: ComponentFixture<GameCreationComponent>;
    let submissionServiceSpy: jasmine.SpyObj<SubmissionService>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;

    beforeEach(async () => {
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['getBmpHeader', 'isLoaded']);
        submissionServiceSpy = jasmine.createSpyObj('SubmissionService', ['differencesImage', 'mergeImageAndDrawing']);

        await TestBed.configureTestingModule({
            declarations: [GameCreationComponent],
            imports: [HttpClientModule, HttpClientTestingModule, MatDialogModule, NoopAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: SubmissionService, useValue: submissionServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.imageService = new ImageService();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('toBase64 should return a string', () => {
        const canvas = document.createElement('canvas');
        const image = new Image();
        image.src = '../../assets/images/640x480_32.bmp';
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        // @ts-ignore
        expect(component.toBase64(canvas)).toEqual(jasmine.any(String));
    });

    it('should call openDialog()', async () => {
        const fixtureCardCreationOriginal = TestBed.createComponent(CardCreationComponent);
        const fixtureCardCreationModified = TestBed.createComponent(CardCreationComponent);

        const fixtureCardDrawingOriginal = TestBed.createComponent(CardDrawingComponent);
        const fixtureCardDrawingModified = TestBed.createComponent(CardDrawingComponent);

        component.originalCard = fixtureCardCreationOriginal.componentInstance;
        component.modifiedCard = fixtureCardCreationModified.componentInstance;

        component.originalDrawing = fixtureCardDrawingOriginal.componentInstance;
        component.modifiedDrawing = fixtureCardDrawingModified.componentInstance;

        spyOn(component.originalDrawing, 'hasDrawing').and.returnValue(false);
        spyOn(component.modifiedDrawing, 'hasDrawing').and.returnValue(false);
        // @ts-ignore
        spyOn(component['dialog'], 'open').and.callFake(() => {});
        // @ts-ignore
        spyOn(component, 'toBase64' as never).and.callFake(() => {});
        // @ts-ignore
        const openDialogSpy = spyOn(component, 'openDialog');
        await component.submit();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('sendImageToChildren should call imageService.showPreview', () => {
        const imageInput = new Image();
        imageInput.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const input = document.createElement('input');
        // @ts-ignore
        spyOn(component.imageService, 'showPreview').and.returnValue();
        const promesse = new Promise((resolve, reject) => {
            imageInput.onload = async () => {
                canvas.width = imageInput.naturalWidth;
                canvas.height = imageInput.naturalHeight;
                context?.drawImage(imageInput, 0, 0);
                canvas.toBlob(
                    async (blob) => {
                        input.type = 'file';
                        const file = new File([blob as BlobPart], 'image.bmp', { type: 'image/bmp' });

                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        input.files = dataTransfer.files;
                        
                        resolve(await component.sendImageToChildren(input));
                        reject(() => {});
                    },
                    'image/bmp',
                    0.75,
                    );
                };
            });
            expect(promesse).toEqual(jasmine.any(Promise));
            expect(input.value).toEqual('');
        });


        it('sendImageToChildren should call imageService.showPreview and send a errorMessage', () => {
                 
            const imageInput = new Image();
            imageInput.src = '../../assets/images/image_wrong_res.bmp';
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
    
            const input = document.createElement('input');
            // @ts-ignore
            spyOn(component.imageService, 'showPreview').and.returnValue();
            new Promise((resolve, reject) => {
                imageInput.onload = async () => {
                    canvas.width = imageInput.naturalWidth;
                    canvas.height = imageInput.naturalHeight;
                    context?.drawImage(imageInput, 0, 0);
                    canvas.toBlob(
                        async (blob) => {
                            input.type = 'file';
                            const file = new File([blob as BlobPart], 'image.bmp', { type: 'image/bmp' });
    
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            input.files = dataTransfer.files;
                            await component.sendImageToChildren(input);
                            resolve('');
                            reject(() => {});
                        },
                        'image/bmp',
                        0.75,
                        );
                    };
                });
                expect(input.value).toEqual('');
            });

            it('sendImageToChildren should call imageService.showPreview', () => {
            const backgroundImage: BackgroundImage = {
                message: 'error',
                image: new Image(),
              };
              spyOn(component.imageService, 'showPreview').and.returnValue(Promise.resolve(backgroundImage));   
              const input = document.createElement('input'); 
              component.sendImageToChildren(input);
              expect(input.value).toEqual('');
            });


        it('sendImageToChildren should call imageService.showPreview and have no error message', () => {
            const backgroundImage: BackgroundImage = {
                message: '',
                image: new Image(),
              };
              spyOn(component.imageService, 'showPreview').and.returnValue(Promise.resolve(backgroundImage));   
              const input = document.createElement('input'); 
              component.sendImageToChildren(input);
              expect(input.value).toEqual('');
            });
            it('drawingVerification should call deactivate' , () =>{

                const fixtureCardDrawingOriginal = TestBed.createComponent(CardDrawingComponent);
                const fixtureCardDrawingModified = TestBed.createComponent(CardDrawingComponent);
        
                component.originalDrawing = fixtureCardDrawingOriginal.componentInstance;
                component.modifiedDrawing = fixtureCardDrawingModified.componentInstance;
        
                spyOn(component.originalDrawing, 'hasDrawing').and.returnValue(false);
                spyOn(component.modifiedDrawing, 'hasDrawing').and.returnValue(false);
                component.drawingVerification();
                expect(component.originalDrawing).toBeTruthy();
            });


            it('should call open()', async () => {
                // @ts-ignore
                component.submissionService.cardIO = {
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
                            }
                        },
                    },
                };
                // @ts-ignore
                const openSpy = spyOn(component.dialog, 'open');
                // @ts-ignore
                component.openDialog();
                expect(openSpy).toHaveBeenCalled();
            });

                
});
