import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AbandonConfirmationComponent } from '@app/components/abandon-confirmation/abandon-confirmation.component';
import { EndGameComponent } from '@app/components/end-game/end-game.component';
import { GameService } from '@app/services/game/game.service';
import { EASTER_EGG_CODE } from './game-page.component.constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    protected easterEggCode: string;
    private endSubscription: Subscription;

    constructor(protected gameService: GameService, private dialog: MatDialog) {
        this.endSubscription = this.gameService.endPopUpSubject.subscribe(() => {
            if (this.gameService.getEndPopUpVisibility()) this.dialog.open(EndGameComponent, { disableClose: true });
        });
        this.easterEggCode = EASTER_EGG_CODE;
    }

    ngOnDestroy(): void {
        this.endSubscription.unsubscribe();
    }

    protected openAbandonConfirmation(): void {
        this.dialog.open(AbandonConfirmationComponent);
    }
}
