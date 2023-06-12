import { Injectable } from '@angular/core';
import { NUMERIC_FORMAT_THRESHOLD, TIME_FORMAT_THRESHOLD } from './timer.service.constants';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private sec: number;
    private min: number;

    constructor() {
        this.sec = 0;
        this.min = 0;
    }

    updateTime(time: number) {
        this.min = Math.floor(time / TIME_FORMAT_THRESHOLD);
        this.sec = time - this.min * TIME_FORMAT_THRESHOLD;
    }

    formatTime() {
        return this.formatNumber(this.min) + ':' + this.formatNumber(this.sec);
    }

    formatNumber(number: number) {
        return number < NUMERIC_FORMAT_THRESHOLD ? '0' + number : number;
    }
}
