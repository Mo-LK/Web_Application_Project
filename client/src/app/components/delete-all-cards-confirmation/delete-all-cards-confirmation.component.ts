import { Component } from '@angular/core';
import { CardSelectionChangeService } from '@app/services/card-selection-change/card-selection-change.service';

@Component({
    selector: 'app-delete-all-cards-confirmation',
    templateUrl: './delete-all-cards-confirmation.component.html',
    styleUrls: ['./delete-all-cards-confirmation.component.scss'],
})
export class DeleteAllCardsConfirmationComponent {
    constructor(protected cardChangeService: CardSelectionChangeService) {}
}
