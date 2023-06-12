/* eslint-disable @typescript-eslint/no-empty-function */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

const fakeFunc: () => Promise<void> = async () => {
    await new Promise<void>((resolve) => resolve());
};

describe('SoundService', () => {
    let service: SoundService;

    beforeEach(() => {
        TestBed.configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });
        service = TestBed.inject(SoundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sucess() should call audio.load and play for success sound', () => {
        spyOn(service['audio'], 'load').and.callFake(() => {});
        spyOn(service['audio'], 'play').and.callFake(fakeFunc);
        service.success();
        expect(service['audio'].src).toContain('sucess_sound.mp3');
    });

    it('error() should call audio.load and play for error sound', () => {
        spyOn(service['audio'], 'load').and.callFake(() => {});
        spyOn(service['audio'], 'play').and.callFake(fakeFunc);
        service.error();
        expect(service['audio'].src).toContain('error.mp3');
    });
});
