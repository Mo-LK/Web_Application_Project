import { Component, Input, OnChanges } from '@angular/core';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';
import { HistoryService } from '@app/services/history/history.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { Card } from '@common/card';
import { ViewMode } from './selection-area.component.constants';
import { MatDialog } from '@angular/material/dialog';
import { HistoryComponent } from '@app/components/history/history.component';
import { DeleteAllCardsConfirmationComponent } from '@app/components/delete-all-cards-confirmation/delete-all-cards-confirmation.component';
import { ResetAllStatsConfirmationComponent } from '@app/components/reset-all-stats-confirmation/reset-all-stats-confirmation.component';

@Component({
    selector: 'app-selection-area',
    templateUrl: './selection-area.component.html',
    styleUrls: ['./selection-area.component.scss'],
})
export class SelectionAreaComponent implements OnChanges {
    @Input() viewMode!: ViewMode;
    @Input() cardDataArray: Card[];
    isConfigMode: boolean;
    protected imagePaths: string[];

    // We need all of these parameters, so we disable the max-params rule.
    // eslint-disable-next-line max-params
    constructor(
        protected cardChangeService: CardSelectionChangeService,
        protected lobbyService: LobbyService,
        protected historyService: HistoryService,
        public dialog: MatDialog,
    ) {
        this.isConfigMode = false;
        this.imagePaths = new Array();
        this.lobbyService.handleSocket();
    }

    ngOnChanges() {
        this.isConfigMode = this.viewMode === ViewMode.CONFIGURATION;
    }

    protected openMatchHistory() {
        this.dialog.open(HistoryComponent);
    }

    protected openResetAllStatsConfirmation() {
        this.dialog.open(ResetAllStatsConfirmationComponent);
    }

    protected openDeleteAllCardsConfirmation() {
        this.dialog.open(DeleteAllCardsConfirmationComponent);
    }
}
