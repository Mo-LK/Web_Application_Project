/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Card } from '@common/card';
import { environment } from 'src/environments/environment';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(() => {
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardComponent],
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        component.card = {title:'ok', difficultyLevel: 'Facile' } as Card;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call loadGame() when "Jouer" button is pressed', () => {
        const loadGameSpy = spyOn(component.playEvent, 'emit');
        const button = document.getElementById('playButton');
        button?.click();
        expect(loadGameSpy).toHaveBeenCalled();
    });

    it('getter should return correct info', () => {
        component.card.id = 'test';
        expect(component.cardId).toEqual('test');
    });

    it('ngOnChanges should set imageSource', () => {
        component.card.id = 'test';
        component.ngOnChanges();
        expect(component.imageSource).toEqual(`${environment.serverUrlApi}/image/test_original`);
    });
});
