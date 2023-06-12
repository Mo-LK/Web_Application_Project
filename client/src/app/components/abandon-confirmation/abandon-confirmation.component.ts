import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-abandon-confirmation',
    templateUrl: './abandon-confirmation.component.html',
    styleUrls: ['./abandon-confirmation.component.scss'],
})
export class AbandonConfirmationComponent {
    constructor(protected gameService: GameService) {}
}
