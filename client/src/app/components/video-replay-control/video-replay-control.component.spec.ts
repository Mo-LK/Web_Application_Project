/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VideoReplayControlComponent } from './video-replay-control.component';

describe('VideoReplayControlComponent', () => {
    let component: VideoReplayControlComponent;
    let fixture: ComponentFixture<VideoReplayControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [VideoReplayControlComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('stop should stop the replay and send the player to /home', () => {
        spyOn(component['videoReplayService'], 'stop').and.callFake(() => {});
        spyOn(component['gameService'], 'resetGame').and.callFake(() => {});
        spyOn(component['gameService'], 'navigate').and.callFake(() => {});
        component.stop();
        expect(component['videoReplayService'].stop).toHaveBeenCalled();
        expect(component['gameService'].videoGameControlsAreVisible).toEqual(false);
        expect(component['gameService'].resetGame).toHaveBeenCalled();
        expect(component['gameService'].navigate).toHaveBeenCalledWith('/home');
    });

    it('play should call play from the videoReplayService', () => {
        spyOn(component['videoReplayService'], 'play').and.callFake(() => {});
        component.play();
        expect(component['videoReplayService'].play).toHaveBeenCalled();
    });

    it('pause should call pause from the videoReplayService', () => {
        spyOn(component['videoReplayService'], 'pause').and.callFake(() => {});
        component.pause();
        expect(component['videoReplayService'].pause).toHaveBeenCalled();
    });

    it('restart should restart the replay and send the player to /home', () => {
        spyOn(component['messageService'], 'clearMessages').and.callFake(() => {});
        spyOn(component['videoReplayService'], 'restart').and.callFake(async () => {});
        component.restart();
        expect(component.inputFirstSpeed.nativeElement.checked).toEqual(true);
        expect(component['messageService'].clearMessages).toHaveBeenCalled();
        expect(component['videoReplayService'].restart).toHaveBeenCalled();
    });

    it('setSpeed should call setSpeed from the videoReplayService', () => {
        spyOn(component['videoReplayService'], 'setSpeed').and.callFake(() => {});
        const newSpeed = 4;
        component.setSpeed(newSpeed);
        expect(component['videoReplayService'].setSpeed).toHaveBeenCalledWith(newSpeed);
    });
});
