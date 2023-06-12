/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { UNNECESSARY_VALUE_BASE64 } from '@app/pages/game-creation/game-creation.component.constants';
import { ImageService } from './image.service';

describe('ImageService', () => {
    let imageService: ImageService;
    const RANDOM_WIDTH = 100;
    const RANDOM_HEIGHT = 12344;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        imageService = TestBed.inject(ImageService);
    });

    it('should be created', () => {
        expect(imageService).toBeTruthy();
    });

    it('should return true if the width equals 640 and if the height 480', () => {
        // @ts-ignore
        expect(imageService.isImageSizeValid(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT)).toEqual(true);
    });

    it('should return false if the width is not equals 640 or if the height is not 480', () => {
        // @ts-ignore
        expect(imageService.isImageSizeValid(RANDOM_WIDTH, RANDOM_HEIGHT)).toEqual(false);
    });

    it('should return a HTMLImageElement', async () => {
        // Pour correction, c'est la solution qui a été trouvé après une heure avec Mike pour créer un file
        const imga = new Image();
        imga.src = '../../assets/images/android_modified.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        let file: File = new File([''], 'fake.bmp', { type: 'image/bmp' });

        const promise = new Promise((resolve, reject) => {
            imga.onload = () => {
                canvas.width = imga.naturalWidth;
                canvas.height = imga.naturalHeight;
                context?.drawImage(imga, 0, 0);
                canvas.toBlob(
                    async (blob) => {
                        file = new File([blob as BlobPart], 'image.bmp', { type: 'image/bmp' });
                        const imgb = await imageService.isLoaded(file);

                        const imageABytes = canvas.toDataURL('image/bmp').slice(UNNECESSARY_VALUE_BASE64);
                        context?.drawImage(imgb, 0, 0);
                        const imageBBytes = canvas.toDataURL('image/bmp').slice(UNNECESSARY_VALUE_BASE64);

                        resolve([imageABytes, imageBBytes]);
                        reject();
                        expect(imageABytes).toEqual(imageBBytes);
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
    });

    it('should return true if the image is a bmp 24 bits', async () => {
        const imga = new Image();
        imga.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const promise = new Promise((resolve, reject) => {
            imga.onload = async () => {
                canvas.width = imga.naturalWidth;
                canvas.height = imga.naturalHeight;
                context?.drawImage(imga, 0, 0);
                canvas.toBlob(
                    async (blob) => {
                        const fileImage = new File([blob as BlobPart], 'image.bmp', { type: 'image/bmp' });
                        const dataView = new DataView(await fileImage.arrayBuffer());
                        resolve(dataView);
                        reject();
                        // @ts-ignore
                        expect(imageService.isImageBMP24(dataView)).toEqual(false);
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
    });

    it('showPreview should return a HTMLImageElement', async () => {
        const imageInput = new Image();
        imageInput.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const input = document.createElement('input');
        // @ts-ignore
        spyOn(imageService, 'imageValidations').and.returnValue(true);
        const promise = new Promise((resolve, reject) => {
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
                        await imageService.showPreview(input);
                        resolve('');
                        reject(() => {});
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
        // @ts-ignore
        expect(imageService.imageValidations).toHaveBeenCalled();
    });

    it('should return false if input has no file', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.files = null;
        imageService.showPreview(input);
        expect(imageService.isInputValid(input)).toEqual(false);
    });

    it('should return ERROR_MESSAGE_SIZE if the image is not 640x480', async () => {
        const imageInput = new Image();
        imageInput.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const input = document.createElement('input');
        // @ts-ignore
        const spy = spyOn(imageService, 'isImageSizeValid').and.returnValue(false);
        const promise = new Promise((resolve, reject) => {
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
                        const dataView = new DataView(await file.arrayBuffer());
                        // @ts-ignore
                        imageService.imageValidations({ height: 640, width: 480 }, dataView);
                        resolve('');
                        reject(() => {});
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
        // @ts-ignore
        expect(spy).toHaveBeenCalled();
    });

    it('should return ERROR_MESSAGE_RES if the image is wrong bit size', async () => {
        const imageInput = new Image();
        imageInput.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const input = document.createElement('input');
        // @ts-ignore
        const spySize = spyOn(imageService, 'isImageSizeValid').and.returnValue(true);
        // @ts-ignore
        const spy = spyOn(imageService, 'isImageBMP24').and.returnValue(false);
        const promise = new Promise((resolve, reject) => {
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
                        const dataView = new DataView(await file.arrayBuffer());
                        // @ts-ignore
                        imageService.imageValidations({ height: 640, width: 480 }, dataView);
                        resolve('');
                        reject(() => {});
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
        // @ts-ignore
        expect(spy).toHaveBeenCalled();
    });

    it('should return nothing if all validations are good', async () => {
        const imageInput = new Image();
        imageInput.src = '../../assets/images/640x480_32.bmp';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const input = document.createElement('input');
        // @ts-ignore
        const spySize = spyOn(imageService, 'isImageSizeValid').and.returnValue(true);
        // @ts-ignore
        const spy = spyOn(imageService, 'isImageBMP24').and.returnValue(true);
        const promise = new Promise((resolve, reject) => {
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
                        const dataView = new DataView(await file.arrayBuffer());
                        // @ts-ignore
                        imageService.imageValidations({ height: 640, width: 480 }, dataView);
                        resolve('');
                        reject(() => {});
                    },
                    'image/bmp',
                    0.75,
                );
            };
        });
        await promise;
        // @ts-ignore
        expect(spy).toHaveBeenCalled();
    });
});
