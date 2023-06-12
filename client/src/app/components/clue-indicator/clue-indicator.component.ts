import { Component } from '@angular/core';
import { GameCluesService } from '@app/services/game-clues/game-clues.service';

@Component({
    selector: 'app-clue-indicator',
    templateUrl: './clue-indicator.component.html',
    styleUrls: ['./clue-indicator.component.scss'],
})
export class ClueIndicatorComponent {
    constructor(protected clueService: GameCluesService) {}
}
