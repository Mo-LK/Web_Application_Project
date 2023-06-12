/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/game';
import { LobbyComponent } from '../lobby/lobby.component';
import { NameQueryComponent } from './name-query.component';

describe('NameQueryComponent', () => {
    let component: NameQueryComponent;
    let fixture: ComponentFixture<NameQueryComponent>;

    beforeEach(async () => {
        const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [NameQueryComponent],
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
        jasmine.clock().uninstall();
        jasmine.clock().install();

        fixture = TestBed.createComponent(NameQueryComponent);
        component = fixture.componentInstance;
        const game: Game = {
            id: 'data.id',
            gameTitle: 'data.title',
            firstMode: 'classique',
            secondMode: 'solo',
            difficulty: 'data.difficultyLevel',
            differences: [],
            differencesBackup: [],
        } as Game;
        component.data = { game };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isValidPlayerName should return true if playerName is not empty', () => {
        component['playerName'] = 'test';
        expect(component['isValidPlayerName']()).toBeTruthy();
    });

    it('isValidPlayerName should return false if playerName is empty', () => {
        component['playerName'] = '';
        expect(component['isValidPlayerName']()).toBeFalsy();
    });

    it('isSolo should return true if secondMode is solo', () => {
        component.data.game.secondMode = 'solo';
        expect(component['isSolo']()).toBeTruthy();
    });

    it('onSubmit should call waitForCardValidity if isSolo is true', fakeAsync(() => {
        component['playerName'] = 'Bernard';
        spyOn<any>(component['gameService'], 'waitForCardValidity').and.callFake(() => {});
        spyOn(component['gameService'], 'initializeSelf');
        spyOn(component['gameService'], 'startGame').and.resolveTo();
        spyOn<any>(component, 'isSolo').and.returnValue(true);
        component['onSubmit']();
        jasmine.clock().tick(1000);
        expect(component['gameService']['waitForCardValidity']).toHaveBeenCalled();
        expect(component['gameService'].initializeSelf).toHaveBeenCalledWith('Bernard');
    }));

    it('onSubmit should open lobby if not solo', fakeAsync(() => {
        component['playerName'] = 'Bernard';
        spyOn(component['gameService'], 'initializeSelf').and.callFake(() => {});
        spyOn(component['gameService'], 'startGame').and.resolveTo();
        spyOn(component['dialog'], 'open').and.callFake(() => {
            return 0 as any;
        });
        spyOn<any>(component, 'isSolo').and.returnValue(false);
        component['onSubmit']();
        jasmine.clock().tick(1000);
        expect(component['dialog'].open).toHaveBeenCalledWith(LobbyComponent);
    }));
    
    it('onSubmit should open lobby if isSolo is false', fakeAsync(() => {
        component['playerName'] = 'Bernard';
        spyOn<any>(component['gameService'], 'waitForCardValidity').and.callFake(() => {});
        spyOn(component['gameService'], 'initializeSelf');
        spyOn(component['gameService'], 'startGame').and.resolveTo();
        spyOn(component['lobbyService'], 'enterLobby');
        spyOn<any>(component, 'isSolo').and.returnValue(false);
        component['onSubmit']();
        jasmine.clock().tick(1000);
        expect(component['gameService']['waitForCardValidity']).not.toHaveBeenCalled();
        expect(component['gameService'].initializeSelf).toHaveBeenCalledWith('Bernard');
        expect(component['lobbyService'].enterLobby).toHaveBeenCalled();
        expect(component['lobbyService'].isInLobby).toBe(false);
    }));
});
