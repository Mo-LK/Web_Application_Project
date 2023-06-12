import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClueIndicatorComponent } from './clue-indicator.component';

describe('ClueIndicatorComponent', () => {
    let component: ClueIndicatorComponent;
    let fixture: ComponentFixture<ClueIndicatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClueIndicatorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ClueIndicatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
