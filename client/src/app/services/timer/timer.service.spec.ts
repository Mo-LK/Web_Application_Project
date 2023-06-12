/* eslint-disable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
        jasmine.clock().uninstall();
        jasmine.clock().install();
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('formatNumber should format a number to a length of two', () => {
        expect(service.formatNumber(1)).toEqual('01');
    });

    it('formatTime should format time as min : sec', () => {
        service["min"] = 1;
        service["sec"] = 1;
        expect(service.formatTime()).toEqual('01:01');
    });
    
    it('update time should set attributes based on number of seconds', () => {
        service.updateTime(60);
        expect( service["min"]).toEqual(1);
        expect( service["sec"]).toEqual(0);
    });
});
