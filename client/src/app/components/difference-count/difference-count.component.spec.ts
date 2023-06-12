import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DifferenceCountComponent } from './difference-count.component';

describe('DifferenceCountComponent', () => {
    let component: DifferenceCountComponent;
    let fixture: ComponentFixture<DifferenceCountComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DifferenceCountComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferenceCountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('player name should display correctly', () => {
        component.playerName = 'Tester';
        fixture.detectChanges();
        const element = document.getElementById('player-name');
        expect(element?.textContent).toEqual('Tester');
    });

    it('difference Count should start at 0', () => {
        component.differenceFoundNumber = 6;
        fixture.detectChanges();
        const element = document.getElementById('difference-count');
        expect(element?.textContent).toEqual('6');
    });
});
