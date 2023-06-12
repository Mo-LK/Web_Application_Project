import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistory } from '@app/interfaces/history';
import { HistoryService } from '@app/services/history/history.service';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let historyService: HistoryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryComponent],
            imports: [HttpClientTestingModule],
            providers: [HistoryService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        historyService = TestBed.inject(HistoryService);
        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('back should set confirmationPrompt to false', () => {
        component.confirmationPrompt = true;
        component.back();
        expect(component.confirmationPrompt).toEqual(false);
    });

    it('promptConfirmation should set confirmationPrompt to true', () => {
        component.confirmationPrompt = false;
        component.promptConfirmation();
        expect(component.confirmationPrompt).toEqual(true);
    });

    it('clearMatchHistory should call deleteHistory from historyService', () => {
        spyOn(historyService, 'deleteHistory').and.returnValue(Promise.resolve());
        component.clearMatchHistory();
        expect(historyService['deleteHistory']).toHaveBeenCalled();
    });

    it('establishSurrender should return the corresponding boolean', () => {
        const fakeHistory = {
            dateStarted: 'date',
            timeStarted: 'time',
            timeLength: 'length',
            gameType: 'Classique',
            firstPlayer: 'Didier',
            secondPlayer: 'Michel',
            winnerSocketId: ' ',
            surrender: true,
            surrenderSocketId: ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        } as GameHistory;
        const returnedValueEmpty = component['establishSurrender'](fakeHistory, false);
        expect(returnedValueEmpty).toEqual(true);
        const returnedValueWinner = component['establishSurrender'](fakeHistory, true);
        expect(returnedValueWinner).toEqual(true);
        fakeHistory.gameType = 'Temps limité';
        fakeHistory.surrenderSocketId = '123';
        const returnedValueLimiteFirstPlayer = component['establishSurrender'](fakeHistory, true);
        expect(returnedValueLimiteFirstPlayer).toEqual(true);
        fakeHistory.surrenderSocketId = '000';
        const returnedValueLimiteSecondPlayerSecond = component['establishSurrender'](fakeHistory, true);
        expect(returnedValueLimiteSecondPlayerSecond).toEqual(true);
        const returnedValueLimiteSecondPlayer = component['establishSurrender'](fakeHistory, false);
        expect(returnedValueLimiteSecondPlayer).toEqual(true);
        fakeHistory.surrenderSocketId = '123';
        fakeHistory.surrender = true;
        const returnedValueLimiteSecondPlayerSurr = component['establishSurrender'](fakeHistory, false);
        expect(returnedValueLimiteSecondPlayerSurr).toEqual(true);
    });

    it('establishWinner should return the corresponding boolean', () => {
        const fakeHistory = {
            dateStarted: 'date',
            timeStarted: 'time',
            timeLength: 'length',
            gameType: 'Temps limité',
            firstPlayer: 'Didier',
            secondPlayer: 'Michel',
            winnerSocketId: '123',
            surrender: true,
            surrenderSocketId: ' ',
            firstPlayerSocketId: '123',
            secondPlayerSocketId: '000',
        } as GameHistory;
        const returnedValue = component['establishWinner'](fakeHistory, false, fakeHistory.gameType === 'Temps limité');
        expect(returnedValue).toEqual(true);
        fakeHistory.gameType = 'Classique';
        const returnedValueIf = component['establishWinner'](fakeHistory, true, fakeHistory.gameType === 'Temps limité');
        expect(returnedValueIf).toEqual(true);
        const returnedValueElse = component['establishWinner'](fakeHistory, false, fakeHistory.gameType === 'Temps limité');
        expect(returnedValueElse).toEqual(false);
    });
});
