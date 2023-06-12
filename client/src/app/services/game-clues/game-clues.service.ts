import { Injectable } from '@angular/core';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { DrawService } from '@app/services/draw/draw.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';
import { Coordinate } from '@common/coordinates';
import {
    CLUE_TIMEOUT,
    ClueIteration,
    FIRST_CIRCLE_RADIUS,
    FIRST_SUBDIVISION,
    FOURTH_CIRCLE_RADIUS,
    SECOND_CIRCLE_RADIUS,
    SECOND_SUBDIVISION,
    THIRD_CIRCLE_RADIUS,
    THIRD_CLUE_TIMEOUT,
} from './game-clues.service.constants';

@Injectable({
    providedIn: 'root',
})
export class GameCluesService {
    buttonIsEnable: boolean;
    protected clueNumber: number;
    private rectangleWidth: number;
    private rectangleHeight: number;
    private subdivision: number;

    constructor(private drawService: DrawService, private socketService: SocketClientService, private videoReplayService: VideoReplayService) {
        this.handleSocket();
        this.clueNumber = 3;
        this.buttonIsEnable = true;
    }

    get clueRemaining() {
        return this.clueNumber;
    }

    sendClueEvent() {
        if (this.buttonIsEnable) this.socketService.send('clue');
    }

    resetClueCount() {
        this.clueNumber = 3;
    }

    private displayClue(difference: Coordinate[], randomIndex: number) {
        this.videoReplayService.register({ this: this, method: this.displayClue, params: [difference, randomIndex], timestamp: Date.now() });
        if (difference) {
            this.subdivision = this.clueNumber === 3 ? FIRST_SUBDIVISION : SECOND_SUBDIVISION;
            this.rectangleWidth = DEFAULT_CANVAS_WIDTH / this.subdivision;
            this.rectangleHeight = DEFAULT_CANVAS_HEIGHT / this.subdivision;

            const randomPosition = difference[randomIndex];

            if (this.clueNumber === 1) this.displayThirdClue(randomPosition);
            else {
                const quadrantNumber = this.computeQuadrant(randomPosition);
                const corners = this.getRectangleCorners(quadrantNumber);
                this.drawService.drawQuadrant(corners);
            }
            this.clueNumber--;
        }
    }

    private computeQuadrant(position: Coordinate): number {
        const rectX = Math.floor(position.x / this.rectangleWidth);
        const rectY = Math.floor(position.y / this.rectangleHeight);
        return rectX + rectY * this.subdivision + 1;
    }

    private getRectangleCorners(quadrantNumber: number): Coordinate[] {
        const rectX = (quadrantNumber - 1) % this.subdivision;
        const rectY = Math.floor((quadrantNumber - 1) / this.subdivision);

        const topLeftX = rectX * this.rectangleWidth;
        const topLeftY = rectY * this.rectangleHeight;

        const bottomRightX = topLeftX + this.rectangleWidth;
        const bottomRightY = topLeftY + this.rectangleHeight;

        return [
            { x: topLeftX, y: topLeftY },
            { x: bottomRightX, y: bottomRightY },
        ];
    }

    private handleClueEvent(difference: Coordinate[]) {
        this.buttonIsEnable = false;
        this.displayClue(difference, Math.floor(Math.random() * difference.length));
        window.setTimeout(() => (this.buttonIsEnable = true), CLUE_TIMEOUT);
    }

    private displayThirdClue(position: Coordinate) {
        this.drawService.drawCircle(position, FIRST_CIRCLE_RADIUS);
        let iteration = 2;
        let jobIsRunning = true;
        const intervalId = window.setInterval(() => {
            if (jobIsRunning) {
                switch (iteration) {
                    case ClueIteration.FIRST: {
                        this.drawService.drawCircle(position, SECOND_CIRCLE_RADIUS);
                        break;
                    }
                    case ClueIteration.SECOND: {
                        this.drawService.drawCircle(position, THIRD_CIRCLE_RADIUS);
                        break;
                    }
                    case ClueIteration.THIRD: {
                        this.drawService.drawCircle(position, FOURTH_CIRCLE_RADIUS);
                        jobIsRunning = false;
                        break;
                    }
                }
                iteration++;
            } else {
                window.clearInterval(intervalId);
            }
        }, THIRD_CLUE_TIMEOUT);
        this.videoReplayService.addClueIntervalId(intervalId);
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage('clue', (difference) => this.handleClueEvent(JSON.parse(difference as string) as Coordinate[]));
    }
}
