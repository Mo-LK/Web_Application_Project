/* eslint-disable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { DrawService } from '@app/services/draw/draw.service';
import { Coordinate } from '@common/coordinates';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.contextOriginal = ctxStub;
        service.contextModified = ctxStub;
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawImage should call CanvasRenderingContext2D.drawImage()', async () => {
        const imageSrc = '../../assets/images/640x480_32.bmp';
        spyOn(ctxStub, 'drawImage').and.callFake(() => {});
        await service.drawImage(imageSrc, true);
        expect(ctxStub.drawImage).toHaveBeenCalled();
        await service.drawImage(imageSrc, false);
        expect(ctxStub.drawImage).toHaveBeenCalled();
    });

    it('setPixelsToYellow and resetImages should call getImageData with 0, 0, this.canvaSize.x, this.canvaSize.y', () => {
        const arr = [{ x: 0, y: 0 }];
        const data: ImageData = new ImageData(1, 1);
        const canvasSize: Coordinate = { x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT };
        spyOn(ctxStub, 'getImageData').and.returnValue(data);
        service.setYellowSpot(arr);
        service.resetImages(arr);
        expect(ctxStub.getImageData).toHaveBeenCalledWith(0, 0, canvasSize.x, canvasSize.y);
        expect(ctxStub.getImageData).toHaveBeenCalledTimes(4);
    });

    it('setPixelsToYellow should call putImageData with imgData, 0, 0', () => {
        const arr = [{ x: 0, y: 0 }];
        const imgData = new ImageData(1, 1);
        spyOn(ctxStub, 'getImageData').and.returnValue(imgData);
        spyOn(ctxStub, 'putImageData').and.callFake(() => {});
        service.setYellowSpot(arr);
        service.resetImages(arr);
        expect(ctxStub.putImageData).toHaveBeenCalledTimes(3);
    });

    it('resetModifiedImageToInitialState should call contextMod.drawImage', () => {
        spyOn(ctxStub, 'drawImage').and.callFake(()=>{});
        service.resetModifiedImageToInitialState();
        expect(ctxStub.drawImage).toHaveBeenCalled();
    });

    it('resetOriginalImageToInitialState should call contextOrig.drawImage', () => {
        spyOn(ctxStub, 'drawImage').and.callFake(()=>{});
        service.resetOriginalImageToInitialState();
        expect(ctxStub.drawImage).toHaveBeenCalled();
    });

    it('drawQuadrant should call beginPath and lineTo 4 times', () => {
        spyOn(ctxStub, 'beginPath').and.callFake(()=>{});
        spyOn(ctxStub, 'lineTo').and.callFake(()=>{});
        service.drawQuadrant([{x: 1, y: 1}, {x: 4, y: 1}]);
        expect(ctxStub.beginPath).toHaveBeenCalled();
        expect(ctxStub.lineTo).toHaveBeenCalledTimes(4);
    });

    it('drawCircle should call beginPath and arc', () => {
        spyOn(ctxStub, 'beginPath').and.callFake(()=>{});
        spyOn(ctxStub, 'arc').and.callFake(()=>{});
        service.drawCircle({x: 1, y: 1}, 5);
        expect(ctxStub.beginPath).toHaveBeenCalled();
        expect(ctxStub.arc).toHaveBeenCalled();
    });

    it('corners getter should return quadrantCorners', () => {
        service['quadrantCorners'] = [];
        expect(service.corners).toEqual(service['quadrantCorners']);
    });
});
