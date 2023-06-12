/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SelectionAreaComponent } from './selection-area.component';

describe('SelectionAreaComponent', () => {
    let component: SelectionAreaComponent;
    let fixture: ComponentFixture<SelectionAreaComponent>;
    beforeEach(() => {});

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionAreaComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnChange should set isConfigMode', () => {
        component.viewMode = 1;
        component.ngOnChanges();
        expect(component.isConfigMode).toEqual(true);
    });

    it('openMatchHistory should open dialog', () => {
        const dialogSpy = spyOn<any>(component['dialog'], 'open').and.callFake(() => {});
        component['openMatchHistory']();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('openResetAllStatsConfirmation should open dialog', () => {
        const dialogSpy = spyOn<any>(component['dialog'], 'open').and.callFake(() => {});
        component['openResetAllStatsConfirmation']();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('openResetStatsConfirmation should open dialog', () => {
        const dialogSpy = spyOn<any>(component['dialog'], 'open').and.callFake(() => {});
        component['openDeleteAllCardsConfirmation']();
        expect(dialogSpy).toHaveBeenCalled();
    });
});
