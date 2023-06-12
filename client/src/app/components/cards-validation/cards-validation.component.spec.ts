/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SubmissionService } from '@app/services/submission/submission.service';
import { CardsValidationComponent } from './cards-validation.component';

describe('CardsValidationComponent', () => {
    let component: CardsValidationComponent;
    let fixture: ComponentFixture<CardsValidationComponent>;
    let submissionService: SubmissionService;

    const dialogMock = {
        close: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardsValidationComponent],
            imports: [MatDialogModule, HttpClientModule, RouterModule, RouterTestingModule, MatGridListModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                {
                    provide: UrlSerializer,
                    useClass: class {
                        parse() {}
                        serialize() {}
                    },
                },
            ],
        }).compileComponents();

        submissionService = TestBed.inject(SubmissionService);

        submissionService.cardIO = {
            firstImage: 'Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABA',
            secondImage: '',
            metadata: {
                enlargementRadius: 15,
                differences: [
                    [
                        { x: 165, y: 182 },
                        { x: 166, y: 187 },
                    ],
                ],
                title: 'title2',
                difficultyLevel: 'difficile',
                id: '1739399414-5604969110-9155696849',
                stats: {
                    classical: {
                        solo: [
                            { name: 'Guakamel', score: 235 },
                            { name: 'GharibSidney', score: 501 },
                            { name: 'Bigboy87', score: 1041 },
                        ],
                        versus: [
                            { name: 'Mo-Lk', score: 453 },
                            { name: 'simb59', score: 829 },
                            { name: 'Antoine Soldati', score: 933 },
                        ],
                    },
                },
            },
        };
        fixture = TestBed.createComponent(CardsValidationComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true if numberOfDifferences is larger than 3 and smaller than 9', () => {
        component.numberOfDifferences = 5;
        expect(component.isEnoughDifferences()).toEqual(true);
    });

    it('should return false if numberOfDifferences is smaller than 3', () => {
        component.numberOfDifferences = 1;
        expect(component.isEnoughDifferences()).toEqual(false);
    });

    it('should return false if numberOfDifferenceslarger than 9', () => {
        component.numberOfDifferences = 123;
        expect(component.isEnoughDifferences()).toEqual(false);
    });

    it('save should call submissionService saveCard', () => {
        const saveCardSpy = spyOn(submissionService, 'saveCard');
        spyOn(component['dialogRef'], 'close').and.callThrough();
        component.numberOfDifferences = 6;
        component.gameName = 'title';

        component.save();
        expect(saveCardSpy).toHaveBeenCalled();
    });

    it('should return false if the game has no title', () => {
        component.gameName = '';
        expect(component.isTitleValid()).toEqual(false);
    });

    it('should return true if the game has a title', () => {
        component.gameName = 'title';
        expect(component.isTitleValid()).toEqual(true);
    });
});
