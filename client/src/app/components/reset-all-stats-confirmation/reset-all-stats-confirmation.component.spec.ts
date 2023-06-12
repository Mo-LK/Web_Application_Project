import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ResetAllStatsConfirmationComponent } from './reset-all-stats-confirmation.component';

describe('ResetAllStatsConfirmationComponent', () => {
    let component: ResetAllStatsConfirmationComponent;
    let fixture: ComponentFixture<ResetAllStatsConfirmationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            declarations: [ResetAllStatsConfirmationComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ResetAllStatsConfirmationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
