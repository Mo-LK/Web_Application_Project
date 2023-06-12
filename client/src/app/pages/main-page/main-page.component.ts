import { Component, OnInit } from '@angular/core';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    constructor(private cardChangeService: CardSelectionChangeService, private lobbyService: LobbyService) {}

    async ngOnInit() {
        this.lobbyService.handleSocket();
        await this.cardChangeService.fetchCards();
    }
}
