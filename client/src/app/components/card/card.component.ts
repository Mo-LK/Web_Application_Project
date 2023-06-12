import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ViewMode } from '@app/components/selection-area/selection-area.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Card } from '@common/card';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit, OnChanges {
    @Input() card: Card;
    @Input() viewMode!: ViewMode;
    @Output() playEvent;
    @Output() multiplayerEvent;
    imageSource: string;
    protected isConfigMode: boolean;

    constructor(protected cardChangeService: CardSelectionChangeService, protected lobbyService: LobbyService) {
        this.imageSource = '';
        this.playEvent = new EventEmitter();
        this.multiplayerEvent = new EventEmitter();
    }

    get cardId() {
        return this.card.id;
    }

    async ngOnInit(): Promise<void> {
        this.isConfigMode = this.viewMode === ViewMode.CONFIGURATION;
    }

    ngOnChanges() {
        this.imageSource = `${environment.serverUrlApi}/image/${this.card.id + '_original'}`;
    }

    protected isMultiplayerState() {
        return this.lobbyService.waitingRoomCards.includes(this.cardId);
    }
}
