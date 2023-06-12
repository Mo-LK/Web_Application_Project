import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@app/services/game/game.service';
import { EndGameComponent } from './end-game.component';

describe('EndGameComponent', () => {
    let component: EndGameComponent;
    let fixture: ComponentFixture<EndGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndGameComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(EndGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('replay should call replay from gameService', async () => {
        const gameServiceReplaySpy = spyOn(component['gameService'], 'replay');
        component['replay']();
        expect(component['gameService']['endPopUpVisibility']).toBeFalse();
        expect(component['gameService'].videoGameControlsAreVisible).toBeTrue();
        expect(gameServiceReplaySpy).toHaveBeenCalled();
    });

    it('isLeaderboardPosition should return correct boolean value', async () => {
        component['gameService']['isWinner'] = false;
        component['gameService']['leaderboardPosition'] = 1;
        expect(component['isLeaderboardPosition']()).toEqual(false);
        component['gameService']['isWinner'] = true;
        component['gameService']['leaderboardPosition'] = -1;
        expect(component['isLeaderboardPosition']()).toEqual(false);
        component['gameService']['leaderboardPosition'] = undefined as unknown as number;
        expect(component['isLeaderboardPosition']()).toBeFalsy();
    });
});
