import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('disconnect should call socket.disconnect', () => {
        spyOn(service['gameSocket'], 'disconnect');
        service.disconnect();
        expect(service['gameSocket'].disconnect).toHaveBeenCalled();
    });

    it('send should call socket.emit(event) if no data passed and socket.emit(event, data) if data passed', () => {
        spyOn(service['gameSocket'], 'emit');
        service.send('test');
        expect(service['gameSocket'].emit).toHaveBeenCalledWith('test');
        service.send('test', 'hey');
        expect(service['gameSocket'].emit).toHaveBeenCalledWith('test', 'hey');
    });
});
