import { Injectable } from '@angular/core';
import { ERROR_SOUND_PATH, SUCCESS_SOUND_PATH } from './sound.service.constants';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private audio;

    constructor() {
        this.audio = new Audio();
    }

    success() {
        this.audio.src = SUCCESS_SOUND_PATH;
        this.audio.crossOrigin = 'anonymous';
        this.audio.load();
        this.audio.play();
    }

    error() {
        this.audio.src = ERROR_SOUND_PATH;
        this.audio.crossOrigin = 'anonymous';
        this.audio.load();
        this.audio.play();
    }
}
