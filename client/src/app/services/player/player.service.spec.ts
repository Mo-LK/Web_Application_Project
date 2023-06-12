import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({ schemas: [NO_ERRORS_SCHEMA] });
        service = TestBed.inject(PlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setPlayerName should setPlayerName', () => {
        service.initializeSelf('Tester1');
        expect(service['self'].name).toEqual('Tester1');
        service.initializeOpponent('Tester2');
        expect(service['opponent'].name).toEqual('Tester2');
    });

    it('resetCounter should reset counters', () => {
        service.resetCounter();
        expect(service['self'].differenceCount).toEqual(0);
        expect(service['opponent'].differenceCount).toEqual(0);
    });

    it('incrementPlayerDiffCount should increment player count', () => {
        const player1 = 'Tester1';
        const player2 = 'Tester2';
        service.initializeSelf(player1);
        service.initializeOpponent(player2);
        service.incrementPlayerDiffCount(true);
        expect(service['self'].differenceCount).toEqual(1);
        service.incrementPlayerDiffCount(false);
        expect(service['opponent'].differenceCount).toEqual(1);
    });

    it('getPlayerDiffCount should return player diff count given player name', () => {
        const player1 = 'Tester1';
        const player2 = 'Tester2';
        service.initializeSelf(player1);
        service.initializeOpponent(player2);
        service.incrementPlayerDiffCount(true);
        service.incrementPlayerDiffCount(false);
        expect(service.getPlayerDiffCount(true)).toEqual(1);
        expect(service.getPlayerDiffCount(false)).toEqual(1);
    });
});
