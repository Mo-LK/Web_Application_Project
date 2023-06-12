import { Component } from '@angular/core';
import { TimerService } from '@app/services/timer/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    constructor(public timeService: TimerService) {}
}
