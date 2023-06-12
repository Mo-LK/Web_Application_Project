/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawService } from '@app/services/draw/draw.service';
import { ViewManipulatorService } from './view-manipulator.service';
import { ANIMATION_COOLOFF_DELAY } from './view-manipulator.service.constants';

const fakeFunc: () => Promise<void> = async () => {
    await new Promise<void>((resolve) => resolve());
};

describe('ViewManipulatorService', () => {
    let service: ViewManipulatorService;
    let drawService: DrawService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [ViewManipulatorService, { provide: Router,
                useValue: {
                  navigate: jasmine.createSpy('navigate')
                }}],
        });
        service = TestBed.inject(ViewManipulatorService);
        drawService = TestBed.inject(DrawService);
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('blinkPixels should call setPixelsToYellow and toOg 1 times and delay 2 times with ONE_SECOND_IN_MS / FIVE_SECONDS', fakeAsync(() => {
        const arr = [{ x: 0, y: 0 }];
        spyOn(drawService, 'setYellowSpot').and.callFake(()=>{});
        spyOn(drawService, 'resetImages').and.callFake(()=>{});
        spyOn<any>(service, 'delay');
        service.blinkPixels(arr);
        jasmine.clock().tick(ANIMATION_COOLOFF_DELAY * 2 * 5);
        expect(drawService.setYellowSpot).toHaveBeenCalledWith(arr);
        expect(drawService.resetImages).toHaveBeenCalledWith(arr);
        expect(service["delay"]).toHaveBeenCalledWith(ANIMATION_COOLOFF_DELAY);
        expect(service["delay"]).toHaveBeenCalledTimes(2);
    }));

    it('blinkPixels should not call setYellowSpot if shouldBlink is false', fakeAsync(() => {
       spyOn<any>(service, 'shouldBlink').and.returnValues(false);
       spyOn(drawService, 'setYellowSpot').and.callFake(()=>{});
       service.blinkPixels([{ x: 0, y: 0 }]);
       jasmine.clock().tick(ANIMATION_COOLOFF_DELAY * 2 * 5);
       expect(drawService.setYellowSpot).not.toHaveBeenCalled();
    }));

    it('blinkPixels should not call resetImages if shouldBlink is false', fakeAsync(() => {
        spyOn<any>(service, 'shouldBlink').and.returnValues(true, true, false);
        spyOn(drawService, 'setYellowSpot').and.callFake(()=>{});
        spyOn<any>(drawService, 'resetImages').and.callFake(()=>{});
        service.blinkPixels([{ x: 0, y: 0 }]);
        jasmine.clock().tick(ANIMATION_COOLOFF_DELAY * 2 * 5);
        expect(service['drawService'].resetImages).not.toHaveBeenCalled();
     }));

     it('blinkPixels should not call first delay if shouldBlink is false', fakeAsync(() => {
        spyOn<any>(service, 'shouldBlink').and.returnValues(true, false);
        spyOn(drawService, 'setYellowSpot').and.callFake(()=>{});
        spyOn<any>(drawService, 'resetImages').and.callFake(()=>{});
        spyOn<any>(service, 'delay').and.callFake(()=>{});
        service.blinkPixels([{ x: 0, y: 0 }]);
        jasmine.clock().tick(ANIMATION_COOLOFF_DELAY * 2 * 5);
        expect(service['delay']).toHaveBeenCalledTimes(0);
     }));

    it('blinkPixels should not call last delay if shouldBlink is false', fakeAsync(() => {
        spyOn<any>(service, 'shouldBlink').and.returnValues(true, true, true, false);
        spyOn(drawService, 'setYellowSpot').and.callFake(()=>{});
        spyOn<any>(drawService, 'resetImages').and.callFake(()=>{});
        spyOn<any>(service, 'delay').and.callFake(()=>{});
        service.blinkPixels([{ x: 0, y: 0 }]);
        jasmine.clock().tick(ANIMATION_COOLOFF_DELAY * 2 * 5);
        expect(service['delay']).toHaveBeenCalledTimes(1);
     }));

    it('delay should create a delay with a promise for x milliseconds', fakeAsync(() => {
        const timeMs = 1000;
        let test = false;
        // Only for testing time delay
        service["delay"](timeMs).then(() => {
            test = true;
        });
        jasmine.clock().tick(timeMs);
        expect(test).toEqual(true);
    }));

    it('resetModImage should call delay for 2 * 125 MS, call drawService.resetModifiedImageToInitialState and resetImages', fakeAsync(() => {
        const timeMs = 250;
        const pixelArray = [[{x: 0, y: 0}]];
        spyOn<any>(service, 'delay');
        spyOn(drawService, 'resetModifiedImageToInitialState').and.callFake(()=>{});
        spyOn(drawService, 'resetImages').and.callFake(()=>{});
        service.resetModImage(pixelArray);
        jasmine.clock().tick(timeMs * 2);
        expect(service["delay"]).toHaveBeenCalledWith(timeMs);
        expect(drawService.resetModifiedImageToInitialState).toHaveBeenCalled();
        expect(drawService.resetImages).toHaveBeenCalledWith(pixelArray[0]);
    }));

    it('resetModImage should call drawQuadrant if displayQuadrant is true', fakeAsync(() => {
        const timeMs = 250;
        const pixelArray = [[{x: 0, y: 0}]];
        service['displayQuadrant'] = true;
        spyOn<any>(service, 'delay');
        spyOn(drawService, 'resetModifiedImageToInitialState').and.callFake(()=>{});
        spyOn(drawService, 'resetImages').and.callFake(()=>{});
        spyOn(drawService, 'drawQuadrant').and.callFake(()=>{});
        service.resetModImage(pixelArray);
        jasmine.clock().tick(timeMs * 2);
        expect(drawService.drawQuadrant).toHaveBeenCalled();
    }));

    it('activatedBlinking should call blinkPixels 4 times if shouldBlink is true ', async () => {
        spyOn<any>(service, "shouldBlink").and.returnValue(true);
        spyOn(service, "blinkPixels").and.callFake(fakeFunc);
        await service.activateBlinkingAnimation([]);
        expect(service.blinkPixels).toHaveBeenCalledTimes(4);
    });

    it('activatedBlinking should call resetModifiedImageToInitialState and resetOriginalImageToInitialState if shouldBlink is false ', async () => {
        spyOn<any>(service, "shouldBlink").and.returnValue(false);
        spyOn(service['drawService'], "resetModifiedImageToInitialState").and.callFake(fakeFunc);
        spyOn(service['drawService'], "resetOriginalImageToInitialState").and.callFake(fakeFunc);
        await service.activateBlinkingAnimation([]);
        expect(service['drawService'].resetModifiedImageToInitialState).toHaveBeenCalled();
        expect(service['drawService'].resetOriginalImageToInitialState).toHaveBeenCalled();
    });

    it('shouldBlink should return correct values ', async () => {
        service['videoReplayService']['isReplaying'] = true;
        service['videoReplayService']['isAborted'] = true;
        expect(service['shouldBlink']()).toEqual(false);
        service['videoReplayService']['isReplaying'] = false;
        expect(service['shouldBlink']()).toEqual(true);
        service['videoReplayService']['isReplaying'] = true;
        service['videoReplayService']['isAborted'] = true;
        expect(service['shouldBlink']()).toEqual(false);
    });
});
