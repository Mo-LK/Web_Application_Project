import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PopupMessageComponent } from './popup-message.component';

describe('PopupMessageComponent', () => {
    let component: PopupMessageComponent;
    let fixture: ComponentFixture<PopupMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopupMessageComponent],
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
