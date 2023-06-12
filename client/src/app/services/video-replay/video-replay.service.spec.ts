/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VideoReplayService } from './video-replay.service';
import { ASYNC_FUNCTION_WAITING_TIME } from './video-replay.service.constants';

describe('VideoReplayService', () => {
    let service: VideoReplayService;

    beforeEach(() => {
        TestBed.configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });
        jasmine.clock().uninstall();
        jasmine.clock().install();
        service = TestBed.inject(VideoReplayService);
    });

    it('isInReplayMode should return the isReplaying state', () => {
        service['isReplaying'] = true;
        expect(service.isInReplayMode).toEqual(true);
    });

    it('isInAbortedState should return the isReplaying state', () => {
        service['isAborted'] = true;
        expect(service.isInAbortedState).toEqual(true);
    });

    it('isInPausedState should return the isPaused state', () => {
        service['isPaused'] = true;
        expect(service.isInPausedState).toEqual(true);
    });

    it('register should create a new array containing only the new event on initializeSelf', () => {
        const startGameClass = new TestingClassStub();
        const initialTimestamp = Date.now();
        const gameEvent = { this: startGameClass, method: startGameClass.startGame, timestamp: initialTimestamp };
        service['shouldRegister'] = true;
        service.register(gameEvent);
        expect(service['gameEvents']).toEqual([{ this: startGameClass, method: startGameClass.startGame, timestamp: 0 }]);
        expect(service['startTimestamp']).toEqual(initialTimestamp);
    });

    it('setSpeed should set the new speed if it is allowed', () => {
        const newSpeed = 4;
        service.setSpeed(newSpeed);
        expect(service['speed']).toEqual(newSpeed);
    });

    it('setSpeed should not set the new speed if it is not allowed', () => {
        const newSpeed = 10;
        const previousSpeed = 1;
        service['speed'] = previousSpeed;
        service.setSpeed(newSpeed);
        expect(service['speed']).toEqual(previousSpeed);
    });

    it('stop should set attributes to a stopped state', () => {
        service.stop();
        expect(service['isAborted']).toEqual(true);
        expect(service['shouldRegister']).toEqual(true);
    });

    it('play should set attributes to a play state', () => {
        service.play();
        expect(service['isPaused']).toEqual(false);
    });

    it('pause should set attributes to a paused state', () => {
        service.pause();
        expect(service['isPaused']).toEqual(true);
    });

    it('restart should call stop and replay', async () => {
        spyOn(service, 'stop').and.callFake(() => {});
        spyOn(service, 'replay').and.callFake(async () => {});
        service['isReplaying'] = false;
        await service.restart();
        expect(service.stop).toHaveBeenCalled();
        expect(service.replay).toHaveBeenCalled();
    });

    it('restart should wait for the previous replay to be completed', fakeAsync(() => {
        spyOn(service, 'stop').and.callFake(() => {});
        spyOn(service, 'replay').and.callFake(async () => {});
        spyOn<any>(service, 'isReplaying');
        service['isReplaying'] = true;
        service.restart();
        tick(1000);
        service['isReplaying'] = false;
        tick(1000);
        expect(service.stop).toHaveBeenCalled();
        expect(service.replay).toHaveBeenCalled();
    }));

    it('replay should execute every game event', fakeAsync(() => {
        const gameEventStub = { this: service, method: () => {}, timestamp: Date.now() };
        service['gameEvents'] = [gameEventStub, gameEventStub, gameEventStub, gameEventStub, gameEventStub];
        spyOn(service['drawService'], 'resetModifiedImageToInitialState').and.callFake(() => {});
        spyOn<any>(service, 'resetAttributes').and.callFake(async () => {});
        spyOn<any>(service, 'executeGameEvent').and.callFake(async () => {});
        spyOn<any>(service, 'stop').and.callFake(async () => {});
        spyOn<any>(service, 'clearClues').and.callFake(async () => {});
        service['isReplaying'] = false;
        service.replay();
        tick(ASYNC_FUNCTION_WAITING_TIME);
        expect(service['drawService']['resetModifiedImageToInitialState']).toHaveBeenCalled();
        expect(service['resetAttributes']).toHaveBeenCalled();
        expect(service['executeGameEvent']).toHaveBeenCalledTimes(service['gameEvents'].length);
        expect(service['stop']).toHaveBeenCalled();
    }));

    it('replay should abort before executing every game event if isAborted is true', fakeAsync(() => {
        const gameEventStub = { this: service, method: () => {}, timestamp: Date.now() };
        service['gameEvents'] = [gameEventStub, gameEventStub, gameEventStub, gameEventStub, gameEventStub];
        spyOn(service['drawService'], 'resetModifiedImageToInitialState').and.callFake(() => {});
        spyOn<any>(service, 'resetAttributes').and.callFake(async () => {});
        spyOn<any>(service, 'executeGameEvent').and.callFake(async () => {
            service['isAborted'] = true;
        });
        spyOn<any>(service, 'stop').and.callFake(async () => {});
        service['isReplaying'] = false;
        service.replay();
        tick(ASYNC_FUNCTION_WAITING_TIME);
        expect(service['drawService']['resetModifiedImageToInitialState']).toHaveBeenCalled();
        expect(service['resetAttributes']).toHaveBeenCalled();
        expect(service['executeGameEvent']).not.toHaveBeenCalledTimes(service['gameEvents'].length);
        expect(service['stop']).toHaveBeenCalled();
    }));

    it('executeGameEvent should execute the game event when his time is met', fakeAsync(() => {
        service['isAborted'] = false;
        service['isPaused'] = false;
        service['timer'] = 0;
        spyOn<any>(service, 'execute').and.callFake(async () => {});
        service['executeGameEvent']({ this: service, method: service.register, timestamp: 500 });
        tick(1000);
        expect(service['execute']).toHaveBeenCalled();
    }));

    it('executeGameEvent should not execute the game event if the video replay has been aborted', async () => {
        service['isAborted'] = true;
        service['timer'] = 0;
        spyOn<any>(service, 'execute').and.callFake(async () => {});
        service['executeGameEvent']({ this: service, method: service.register, timestamp: 500 });
        expect(service['execute']).not.toHaveBeenCalled();
        expect(service['timer']).toEqual(0);
    });

    it('resetAttribute should reset the attributes correctly', async () => {
        service['resetAttributes']();
        expect(service['speed']).toEqual(1);
        expect(service['timer']).toEqual(0);
        expect(service['isAborted']).toEqual(false);
        expect(service['isPaused']).toEqual(false);
        expect(service['isReplaying']).toEqual(false);
        expect(service['shouldRegister']).toEqual(true);
    });

    it('clearClues should clear registered timeouts and intervals', async () => {
        const timeoutIds = [1, 2, 3, 4, 5];
        const intervalIds = [6, 7, 8, 9, 10, 11, 12];
        service['clueTimeoutIds'] = timeoutIds;
        service['clueIntervalIds'] = intervalIds;
        spyOn(window, 'clearTimeout').and.callFake(() => {});
        spyOn(window, 'clearInterval').and.callFake(() => {});
        service['clearClues']();
        expect(clearTimeout).toHaveBeenCalledTimes(timeoutIds.length);
        expect(clearInterval).toHaveBeenCalledTimes(intervalIds.length);
    });

    it('execute should call the game event with the speed as parameter if the method is toggleCheatMode', async () => {
        const testingClassStub = new TestingClassStub();
        const gameEvent = { this: testingClassStub, method: testingClassStub.toggleCheatMode, timestamp: Date.now() };
        spyOn(testingClassStub, 'toggleCheatMode').and.callFake(() => {});
        service['speed'] = 4;
        service['execute'](gameEvent);
        expect(service['speed']).toEqual(4);
    });

    it('execute should call the game event with parameters if params are given', async () => {
        spyOn(service, 'setSpeed').and.callFake(() => {});
        service['execute']({ this: service, method: service.setSpeed, params: [4], timestamp: Date.now() });
        expect(service.setSpeed).toHaveBeenCalledWith(4);
    });

    it('execute should call the game event without parameters if no params are given', async () => {
        spyOn(service, 'pause').and.callFake(() => {});
        service['execute']({ this: service, method: service.pause, timestamp: Date.now() });
        expect(service.pause).toHaveBeenCalledWith();
    });
});

class TestingClassStub {
    startGame() {
        return 'nothing interesting';
    }

    toggleCheatMode(param: number) {
        if (param) param += 1;
    }
}
