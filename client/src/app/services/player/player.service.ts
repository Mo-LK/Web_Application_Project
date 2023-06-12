import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private self: Player;
    private opponent: Player;

    constructor(private videoReplayService: VideoReplayService) {
        this.self = { name: 'Moi', differenceCount: 0 };
        this.opponent = { name: 'Adversaire', differenceCount: 0 };
    }

    get selfName() {
        return this.self.name;
    }

    get opponentName() {
        return this.opponent.name;
    }

    get selfDiffCount() {
        return this.self.differenceCount;
    }

    get opponentDiffCount() {
        return this.opponent.differenceCount;
    }

    incrementPlayerDiffCount(isSelf: boolean) {
        if (isSelf) this.self.differenceCount++;
        else this.opponent.differenceCount++;
    }

    getPlayerDiffCount(isSelf: boolean) {
        return isSelf ? this.self.differenceCount : this.opponent.differenceCount;
    }

    initializeSelf(name: string, diffCount: number = 0) {
        this.videoReplayService.register({ this: this, method: this.initializeSelf, params: [name, diffCount], timestamp: Date.now() });
        this.self.name = name;
        this.self.differenceCount = diffCount;
    }

    initializeOpponent(name: string, diffCount: number = 0) {
        this.videoReplayService.register({ this: this, method: this.initializeOpponent, params: [name, diffCount], timestamp: Date.now() });
        this.opponent.name = name;
        this.opponent.differenceCount = diffCount;
    }

    resetCounter() {
        this.opponent.differenceCount = 0;
        this.self.differenceCount = 0;
    }
}
