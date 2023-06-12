import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionAreaComponent } from '@app/components/selection-area/selection-area.component';
import { ViewMode } from '@app/components/selection-area/selection-area.component.constants';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit {
    @ViewChild('selectionArea') selectionArea: SelectionAreaComponent;
    viewMode: ViewMode;

    constructor(protected cardChangeService: CardSelectionChangeService) {
        this.viewMode = ViewMode.CONFIGURATION;
    }

    async ngOnInit() {
        await this.cardChangeService.fetchCards();
    }
}
