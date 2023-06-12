import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaderboardComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('formatTime() should return a correctly formatted string', () => {
        const timeInSeconds = 1;
        const expectedResult = '00m01s';
        expect(component.formatTime(timeInSeconds)).toEqual(expectedResult);
    });
});
