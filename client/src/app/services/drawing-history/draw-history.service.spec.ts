import { TestBed } from '@angular/core/testing';

import { DrawHistoryService } from './draw-history.service';

describe('DrawHistoryService', () => {
    let service: DrawHistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
