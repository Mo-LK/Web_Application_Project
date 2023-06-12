/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { GameService } from '@app/services/game/game.service';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from './play-area.component.constants';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let gameService: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        gameService = TestBed.inject(GameService);
        gameService.errorPosition = { x: 0, y: 0 };
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getter for width should return 640 (image width)', () => {
        expect(component.width).toEqual(DEFAULT_CANVAS_WIDTH);
    });

    it('getter for height should return 480 (image width)', () => {
        expect(component.height).toEqual(DEFAULT_CANVAS_HEIGHT);
    });

    it('drawImages should call drawImage if is not limitedMode', async () => {
        component['canva1'] = new ElementRef<HTMLCanvasElement>({} as HTMLCanvasElement);
        component['canva2'] = new ElementRef<HTMLCanvasElement>({} as HTMLCanvasElement);
        spyOn(component['drawService'], 'drawImage').and.resolveTo();
        component['cardId'] = FirstGameMode.LIMITED_TIME;
        await component['drawImages']();
        expect(component['drawService'].drawImage).not.toHaveBeenCalled();
        component['cardId'] = '1';
        await component['drawImages']();
        expect(component['drawService'].drawImage).toHaveBeenCalledTimes(2);
    });

    it('ngOnChanges should call drawImages', async () => {
        spyOn<any>(component, 'drawImages').and.resolveTo();
        component.ngOnChanges();
        expect(component['drawImages']).toHaveBeenCalled();
    });
});
