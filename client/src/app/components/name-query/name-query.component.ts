import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LobbyComponent } from '@app/components/lobby/lobby.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { MAX_LENGTH_NAME, PLACEHOLDER_NAME } from './name-query.component.constants';

@Component({
    selector: 'app-name-query',
    templateUrl: './name-query.component.html',
    styleUrls: ['./name-query.component.scss'],
})
export class NameQueryComponent {
    protected playerName: string;
    protected placeholderName: string;
    protected readonly maxLengthName = MAX_LENGTH_NAME;

    // We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private gameService: GameService,
        private lobbyService: LobbyService,
        private dialogRef: MatDialogRef<NameQueryComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { game: Game },
    ) {
        this.playerName = '';
        this.placeholderName = PLACEHOLDER_NAME;
    }

    protected isValidPlayerName(): boolean {
        return this.playerName.trim() !== '' && this.playerName.length <= MAX_LENGTH_NAME;
    }

    protected isSolo(): boolean {
        return this.data.game.secondMode === 'solo';
    }

    protected async onSubmit(): Promise<void> {
        if (this.isValidPlayerName()) {
            if (this.isSolo()) await this.gameService.startGame(false, this.gameService.isClassicMode);
            this.gameService.initializeSelf(this.playerName);
            this.lobbyService.enterLobby(this.isSolo());
            if (this.isSolo()) {
                this.gameService.waitForCardValidity();
            } else {
                this.dialog.open(LobbyComponent);
            }
            this.dialogRef.close();
        }
    }
}
