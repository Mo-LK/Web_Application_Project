import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInformationComponent } from './game-information.component';

describe('GameInformationComponent', () => {
    let component: GameInformationComponent;
    let fixture: ComponentFixture<GameInformationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInformationComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
