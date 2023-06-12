/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if gameService.endPopUpVisibility is true, dialog should call open', () => {
        const dialogSpy = spyOn<any>(component['dialog'], 'open').and.callFake(() => {});
        component['gameService'].setEndPopUpVisibility(true);
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('openAbandonConfirmation should call dialog.open', () => {
        const dialogSpy = spyOn<any>(component['dialog'], 'open').and.callFake(() => {});
        component['openAbandonConfirmation']();
        expect(dialogSpy).toHaveBeenCalled();
    });
});
