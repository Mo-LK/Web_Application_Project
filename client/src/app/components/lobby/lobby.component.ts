import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
    constructor(protected lobbyService: LobbyService, private dialogRef: MatDialogRef<LobbyComponent>) {
        this.dialogRef.beforeClosed().subscribe(() => {
            if (this.lobbyService.isInLobby) {
                if (this.lobbyService.isGameCreator) {
                    this.lobbyService.discardCreatedGame();
                } else this.lobbyService.abandonWaitingRoom();
            }
        });
    }
}
