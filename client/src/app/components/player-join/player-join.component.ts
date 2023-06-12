import { Component, Input } from '@angular/core';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
    selector: 'app-player-join',
    templateUrl: './player-join.component.html',
    styleUrls: ['./player-join.component.scss'],
})
export class PlayerJoinComponent {
    @Input() numberOfJoin: number;
    @Input() playerName: string;

    constructor(protected lobbyService: LobbyService) {}
}
