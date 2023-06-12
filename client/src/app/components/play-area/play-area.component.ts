import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { DrawService } from '@app/services/draw/draw.service';
import { GameService } from '@app/services/game/game.service';
import { environment } from 'src/environments/environment';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from './play-area.component.constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @Input() cardId: string;
    @ViewChild('canvasOriginal', { static: false }) private canva1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasModified', { static: false }) private canva2!: ElementRef<HTMLCanvasElement>;
    private canvasSize;

    constructor(protected drawService: DrawService, protected gameService: GameService) {
        this.canvasSize = { x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT };
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnChanges() {
        this.drawImages();
    }

    ngAfterViewInit() {
        this.drawService.contextModified = this.canva1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva1.nativeElement.focus();
        this.drawService.contextOriginal = this.canva2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.canva2.nativeElement.focus();
        this.drawImages();
    }

    private async drawImages() {
        if (this.canva1 && this.canva2 && this.cardId !== FirstGameMode.LIMITED_TIME) {
            await this.drawService.drawImage(environment.serverUrlApi + '/image/' + this.cardId + '_original', true);
            await this.drawService.drawImage(environment.serverUrlApi + '/image/' + this.cardId + '_modified', false);
        }
    }
}
