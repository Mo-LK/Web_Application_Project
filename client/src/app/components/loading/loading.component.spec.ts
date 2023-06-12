import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
    let component: LoadingComponent;
    let fixture: ComponentFixture<LoadingComponent>;
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoadingComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule, NoopAnimationsModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if finishLoading is true, dialog should call close', () => {
        component['submissionService']['finishedLoadingSubject'].next(true);
        expect(mockDialogRef.close).toHaveBeenCalled();
    });
});
