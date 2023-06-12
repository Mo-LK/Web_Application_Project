import { Component, Input } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';
import { TIME_FORMAT_THRESHOLD } from '@app/services/timer/timer.service.constants';
import { CardStats } from '@common/card-stats';
import { DEFAULT_STATS } from './leaderboard.component.constants';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent {
    @Input() stats: CardStats;

    constructor(private timeService: TimerService) {
        this.stats = DEFAULT_STATS;
    }

    formatTime(timeInSeconds: number): string {
        const minutes = Math.floor(timeInSeconds / TIME_FORMAT_THRESHOLD);
        const seconds = timeInSeconds % TIME_FORMAT_THRESHOLD;
        const formattedMinutes = this.timeService.formatNumber(minutes);
        const formattedSeconds = this.timeService.formatNumber(seconds);
        return `${formattedMinutes}m${formattedSeconds}s`;
    }
}
