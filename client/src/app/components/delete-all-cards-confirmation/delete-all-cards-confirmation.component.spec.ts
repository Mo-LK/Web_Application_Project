import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { DeleteAllCardsConfirmationComponent } from './delete-all-cards-confirmation.component';

describe('DeleteAllCardsConfirmationComponent', () => {
    let component: DeleteAllCardsConfirmationComponent;
    let fixture: ComponentFixture<DeleteAllCardsConfirmationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            declarations: [DeleteAllCardsConfirmationComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteAllCardsConfirmationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
