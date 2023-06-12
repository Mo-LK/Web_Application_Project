import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-popup-message',
    templateUrl: './popup-message.component.html',
    styleUrls: ['./popup-message.component.scss'],
})
export class PopupMessageComponent {
    constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
