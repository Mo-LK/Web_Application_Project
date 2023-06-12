/* eslint-disable */
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameConstants } from '@common/game-constants';
import { Observable, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketClientService } from '../socket-client/socket-client.service';
import { InputValidationService } from './input-validation.service';
import { DEFAULT_TIMES } from './input-validation.service.constants';

describe('InputValidationService', () => {
    let service: InputValidationService;
    let socketHelper: SocketTestHelper;
    let socket: any;
    let clientService: SocketClientService;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA] });
        service = TestBed.inject(InputValidationService);
        service['socketService']['gameSocket']['id'] = 'idd';
        socket = {
            on: jasmine.createSpy(),
            emit: jasmine.createSpy(),
        };
        clientService = new SocketClientService();
        clientService['gameSocket'] = socket;
        spyOn(service['socketService'], 'connect').and.callFake(() => {
            service['socketService']['gameSocket'] = socketHelper as unknown as Socket;
        });
        spyOn(service['socketService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) => {
            socketHelper.on(event, callback);
        });
        service['handleSocket']();
        clientService.connect();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('removeAllZeroes should remove all zeroes from the beginning of the string', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '0001230';
        service.removeAllFirstZeroes(input);
        expect(input.value).toBe('1230');
    });

    it('validateKey should return true when key is a number', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        expect(service.validateKeyPress(event)).toBeTrue();
    });

    it('resetValues should reset all values to default', () => {
        service.constants = DEFAULT_TIMES;
        service['initialInputIsInvalid'] = true;
        service['penaltyInputIsInvalid'] = true;
        service['gainInputIsInvalid'] = true;
        service.resetValues();
        expect(service.constants).toEqual(DEFAULT_TIMES);
        expect(service['initialInputIsInvalid']).toBeFalse();
        expect(service['penaltyInputIsInvalid']).toBeFalse();
        expect(service['gainInputIsInvalid']).toBeFalse();
    });

    it('verifyInitial should set initialInputIsInvalid to true when input is empty', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '';
        service.verifyInitial({ nativeElement: input });
        expect(service['initialInputIsInvalid']).toBeTrue();
    });

    it('verifyInitial should set initialInputIsInvalid to true when input is 3000', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '3000';
        service.verifyInitial({ nativeElement: input });
        expect(service['initialInputIsInvalid']).toBeTrue();
    });

    it('verifyInitial should set initialInputIsInvalid to false when input is 45', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '45';
        service.verifyInitial({ nativeElement: input });
        expect(service['initialInputIsInvalid']).toBeFalse();
    });

    it('verifyPenalty should set penaltyInputIsInvalid to true when input is empty', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '';
        service.verifyPenalty({ nativeElement: input });
        expect(service['penaltyInputIsInvalid']).toBeTrue();
    });

    it('verifyPenalty should set penaltyInputIsInvalid to true when input is 3000', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '3000';
        service.verifyPenalty({ nativeElement: input });
        expect(service['penaltyInputIsInvalid']).toBeTrue();
    });

    it('verifyGain should set gainInputIsInvalid to true when input is empty', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '';
        service.verifyGain({ nativeElement: input });
        expect(service['gainInputIsInvalid']).toBeTrue();
    });

    it('verifyGain should set gainInputIsInvalid to true when input is 3000', () => {
        const input: HTMLInputElement = document.createElement('input');
        input.value = '3000';
        service.verifyGain({ nativeElement: input });
        expect(service['gainInputIsInvalid']).toBeTrue();
    });

    it('should set constants when constantsChanged event is received', () => {
        const constants = {initial: 4} as GameConstants;
        socketHelper.peerSideEmit('constantsChanged', JSON.stringify(constants));
        expect(service['constants']).toEqual(constants);
    });

    it('setConstants should call copyConstants', async () => {
        spyOn<any>(service, 'copyConstants');
        const responseMessage1: Observable<HttpResponse<string>> = of(new HttpResponse<string>());
        spyOn<any>(service['communicationService'], 'postRequest').and.returnValue(responseMessage1);
        service['initialInputIsInvalid'] = false;
        service['penaltyInputIsInvalid'] = false;
        service['gainInputIsInvalid'] = false;
        const differentTimes = {
            initial: 35,
            penalty: 5,
            gain: 5,
        } as GameConstants;
        service.constants = DEFAULT_TIMES;
        service['previousConstants'] = differentTimes;
        await service.setConstants();
        expect(service['copyConstants']).toHaveBeenCalled();
    });

    it('constantsAreDifferentThanPrevious should return true when constants are different than previous', () => {
        const differentTimes = {
            initial: 35,
            penalty: 5,
            gain: 5,
        } as GameConstants;
        service.constants = DEFAULT_TIMES;
        service['previousConstants'] = differentTimes;
        expect(service.constantsAreDifferentFromPrevious()).toBeTrue();
    });

    it('fetchConstants should call copyConstants', async () => {
        spyOn<any>(service, 'copyConstants');
        const responseMessage1: Observable<HttpResponse<string>> = of(new HttpResponse<string>());
        spyOn<any>(service['communicationService'], 'getRequest').and.returnValue(responseMessage1);
        await service['fetchConstants']();
        expect(service['copyConstants']).toHaveBeenCalled();
    });
});
