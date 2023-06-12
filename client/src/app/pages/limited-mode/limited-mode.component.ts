import { Component, OnInit } from '@angular/core';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
    selector: 'app-limited-mode',
    templateUrl: './limited-mode.component.html',
    styleUrls: ['./limited-mode.component.scss'],
})
export class LimitedModeComponent implements OnInit {
    constructor(protected cardChangeService: CardSelectionChangeService, private lobbyService: LobbyService, protected gameService: GameService) {}

    async ngOnInit() {
        this.lobbyService.handleSocket();
    }

    protected isMultiplayerState() {
        return this.lobbyService.waitingRoomCards.includes(FirstGameMode.LIMITED_TIME);
    }
}
