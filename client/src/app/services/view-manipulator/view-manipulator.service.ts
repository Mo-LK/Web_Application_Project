import { Injectable } from '@angular/core';
import { DrawService } from '@app/services/draw/draw.service';
import { Coordinate } from '@common/coordinates';
import { ANIMATION_COOLOFF_DELAY, BLINKING_ANIMATION_OCCURENCE } from './view-manipulator.service.constants';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';

@Injectable({
    providedIn: 'root',
})
export class ViewManipulatorService {
    displayQuadrant: boolean;

    constructor(private drawService: DrawService, private videoReplayService: VideoReplayService) {}

    async activateBlinkingAnimation(pixelArr: Coordinate[], speed: number = 1) {
        for (let i = 0; i < BLINKING_ANIMATION_OCCURENCE; i++) {
            if (this.shouldBlink()) {
                await this.blinkPixels(pixelArr, speed);
            } else {
                this.drawService.resetModifiedImageToInitialState();
                this.drawService.resetOriginalImageToInitialState();
                return;
            }
        }
    }

    // We have to stop executing the function as soon as shouldBlink
    // returns false. No other code should be executed.
    async blinkPixels(pixelArr: Coordinate[], speed: number = 1) {
        if (this.shouldBlink()) {
            this.drawService.setYellowSpot(pixelArr);
        } else {
            return;
        }
        if (this.shouldBlink()) {
            await this.delay(ANIMATION_COOLOFF_DELAY / speed);
        } else {
            return;
        }
        if (this.shouldBlink()) {
            this.drawService.resetImages(pixelArr);
        } else {
            return;
        }
        if (this.shouldBlink()) {
            await this.delay(ANIMATION_COOLOFF_DELAY / speed);
        } else {
            return;
        }
    }

    async resetModImage(foundArray: Coordinate[][], speed: number = 1) {
        await this.delay((ANIMATION_COOLOFF_DELAY * 2) / speed);
        this.drawService.resetModifiedImageToInitialState();
        foundArray.forEach((array) => {
            this.drawService.resetImages(array);
        });
        if (this.displayQuadrant) this.drawService.drawQuadrant(this.drawService.corners);
    }

    private async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private shouldBlink(): boolean {
        return (this.videoReplayService.isInReplayMode && !this.videoReplayService.isInAbortedState) || !this.videoReplayService.isInReplayMode;
    }
}
