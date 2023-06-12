import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LimitedModeComponent } from './limited-mode.component';

describe('LimitedModeComponent', () => {
    let component: LimitedModeComponent;
    let fixture: ComponentFixture<LimitedModeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedModeComponent],
            imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
