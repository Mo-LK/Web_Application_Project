import { Injectable } from '@angular/core';
import { DrawService } from '@app/services/draw/draw.service';
import { GameEvent } from '@common/game-event';
import { ALLOWED_REPLAY_SPEEDS, ASYNC_FUNCTION_WAITING_TIME, TIMER_INTERVAL } from './video-replay.service.constants';

@Injectable({
    providedIn: 'root',
})
export class VideoReplayService {
    private gameEvents: GameEvent[];
    private speed: number;
    private timer: number;
    private isAborted: boolean;
    private isPaused: boolean;
    private startTimestamp: number;
    private shouldRegister: boolean;
    private isReplaying: boolean;
    private clueTimeoutIds: number[];
    private clueIntervalIds: number[];

    constructor(private drawService: DrawService) {
        this.gameEvents = new Array();
        this.resetAttributes();
    }

    get isInReplayMode() {
        return this.isReplaying;
    }

    get isInAbortedState() {
        return this.isAborted;
    }

    get isInPausedState() {
        return this.isPaused;
    }

    addClueTimeoutId(timeoutId: number) {
        this.clueTimeoutIds.push(timeoutId);
    }

    addClueIntervalId(timeoutId: number) {
        this.clueTimeoutIds.push(timeoutId);
    }

    register(gameEvent: GameEvent): void {
        if (this.shouldRegister) {
            // startGame is the first method that is registered when a game is started
            if (gameEvent.method.name === 'startGame') {
                this.gameEvents = new Array();
                this.startTimestamp = gameEvent.timestamp;
            }
            gameEvent.timestamp -= this.startTimestamp;
            this.gameEvents.push(gameEvent);
        }
    }

    setSpeed(newSpeed: number): void {
        if (ALLOWED_REPLAY_SPEEDS.includes(newSpeed)) this.speed = newSpeed;
    }

    stop(): void {
        this.isAborted = true;
        this.shouldRegister = true;
    }

    play(): void {
        this.isPaused = false;
    }

    pause(): void {
        this.isPaused = true;
    }

    async restart(): Promise<void> {
        this.stop();
        await new Promise((resolve) => {
            const waitForPreviousReplayCompleted = () => {
                if (!this.isReplaying) {
                    resolve(true);
                } else {
                    setTimeout(waitForPreviousReplayCompleted, TIMER_INTERVAL);
                }
            };
            waitForPreviousReplayCompleted();
        });
        this.replay();
    }

    async replay(): Promise<void> {
        this.drawService.resetModifiedImageToInitialState();
        this.resetAttributes();
        this.isReplaying = true;
        this.shouldRegister = false;

        for (const gameEvent of this.gameEvents) {
            await this.executeGameEvent(gameEvent);
            if (this.isAborted) break;
        }
        this.stop();
        this.clearClues();
        // We must wait for the end of the async functions
        // that have been called to prevent unexpected behavior
        await new Promise((resolve) => setTimeout(resolve, ASYNC_FUNCTION_WAITING_TIME));
        this.isReplaying = false;
    }

    private async executeGameEvent(gameEvent: GameEvent) {
        return new Promise((resolve) => {
            const executeOnTimestamp = () => {
                if (this.isAborted) {
                    resolve(false);
                    return;
                }
                if (!this.isPaused) this.timer += TIMER_INTERVAL * this.speed;

                if (this.timer >= gameEvent.timestamp) {
                    resolve(this.execute(gameEvent));
                } else {
                    setTimeout(executeOnTimestamp, TIMER_INTERVAL);
                }
            };
            executeOnTimestamp();
        });
    }

    private resetAttributes(): void {
        this.clueTimeoutIds = new Array();
        this.clueIntervalIds = new Array();
        this.speed = 1;
        this.timer = 0;
        this.isAborted = false;
        this.isPaused = false;
        this.isReplaying = false;
        this.shouldRegister = true;
    }

    private clearClues(): void {
        for (const timeoutId of this.clueTimeoutIds) {
            clearTimeout(timeoutId);
        }
        for (const intervalId of this.clueIntervalIds) {
            clearInterval(intervalId);
        }
    }

    private execute(gameEvent: GameEvent): void {
        if (gameEvent.method.name === 'toggleCheatMode') {
            gameEvent.method.call(gameEvent.this, this.speed);
        } else if (gameEvent.params) {
            gameEvent.method.call(gameEvent.this, ...gameEvent.params);
        } else {
            gameEvent.method.call(gameEvent.this);
        }
    }
}
