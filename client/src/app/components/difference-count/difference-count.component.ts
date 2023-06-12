import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-difference-count',
    templateUrl: './difference-count.component.html',
    styleUrls: ['./difference-count.component.scss'],
})
export class DifferenceCountComponent {
    @Input() playerName: string;
    @Input() differenceFoundNumber: number;
}
