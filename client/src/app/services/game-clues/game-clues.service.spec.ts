/* eslint-disable */
import { TestBed, fakeAsync } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DEFAULT_CANVAS_HEIGHT, DEFAULT_CANVAS_WIDTH } from '@app/components/play-area/play-area.component.constants';
import { Coordinate } from '@common/coordinates';
import { Socket } from 'socket.io-client';
import { SocketClientService } from '../socket-client/socket-client.service';
import { GameCluesService } from './game-clues.service';
import { CLUE_TIMEOUT, FIRST_SUBDIVISION, SECOND_SUBDIVISION, THIRD_CLUE_TIMEOUT } from './game-clues.service.constants';

describe('GameCluesService', () => {
    let service: GameCluesService;
    let socketHelper: SocketTestHelper;
    let socket: any;
    let clientService: SocketClientService;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]});
        service = TestBed.inject(GameCluesService);
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

    it('resetClue should reset clueNumber to 3', () => {
        service['clueNumber'] = 2;
        service.resetClueCount();
        expect(service['clueNumber']).toEqual(3);
    });

    it('displayClue should call computeQuadrant, getRectangleCorners and drawQuadrant if difference is true', () => {
        spyOn<any>(service, 'computeQuadrant').and.callFake(() => {});
        spyOn<any>(service, 'getRectangleCorners').and.callFake(() => {});
        spyOn<any>(service['drawService'], 'drawQuadrant').and.callFake(() => {});
        service['displayClue'](null as unknown as Coordinate[], 1);
        service['displayClue']([] as Coordinate[], 1);
        expect(service['drawService'].drawQuadrant).toHaveBeenCalledTimes(1);
        expect(service['getRectangleCorners']).toHaveBeenCalledTimes(1);
        expect(service['computeQuadrant']).toHaveBeenCalledTimes(1);
    });

    it('displayClue should call displayThirdClue if clueNumber is 1, not otherwise', () => {
        spyOn<any>(service, 'displayThirdClue').and.callFake(() => {});
        spyOn<any>(service, 'computeQuadrant').and.callFake(() => {});
        spyOn<any>(service, 'getRectangleCorners').and.callFake(() => {});
        spyOn<any>(service['drawService'], 'drawQuadrant').and.callFake(() => {});
        service['clueNumber'] = 1;
        service['displayClue']([{x: 1, y: 1}], 1);
        service['clueNumber'] = 2;
        service['displayClue']([{x: 1, y: 1}], 1);
        expect(service['displayThirdClue']).toHaveBeenCalledTimes(1);
    });

    it('displayClue should set subdivision correctly', () => {
        spyOn<any>(service, 'computeQuadrant').and.callFake(() => {});
        spyOn<any>(service, 'getRectangleCorners').and.callFake(() => {});
        spyOn<any>(service['drawService'], 'drawQuadrant').and.callFake(() => {});
        service['clueNumber'] = 3;
        service['displayClue']([] as Coordinate[], 1);
        expect(service['subdivision']).toEqual(FIRST_SUBDIVISION);
        service['clueNumber'] = 2;
        service['displayClue']([] as Coordinate[], 1);
        expect(service['subdivision']).toEqual(SECOND_SUBDIVISION);
    });

    it('sendClueEvent should send clue event only if buttonIsEnable', () => {
        spyOn<any>(service['socketService'], 'send').and.callFake(() => {});
        service['buttonIsEnable'] = false;
        service['sendClueEvent']();
        service['buttonIsEnable'] = true;
        service['sendClueEvent']();
        expect(service['socketService'].send).toHaveBeenCalledTimes(1);
        expect(service['socketService'].send).toHaveBeenCalledWith('clue');
    });

    it('handleClueEvent should set buttonIsEnable to true after 3 seconds', fakeAsync(() => {
        spyOn<any>(service, 'displayClue').and.callFake(() => {});
        service['buttonIsEnable'] = false;
        service['handleClueEvent']([]);
        jasmine.clock().tick(CLUE_TIMEOUT);
        expect(service['buttonIsEnable']).toEqual(true);
    }));

    it('computeQuadrant should return correct quadrant based on difference and subdivision', () => {
       service['subdivision'] = FIRST_SUBDIVISION;
       service['rectangleWidth'] = DEFAULT_CANVAS_WIDTH / FIRST_SUBDIVISION;
       service['rectangleHeight'] = DEFAULT_CANVAS_HEIGHT / FIRST_SUBDIVISION;
       expect(service['getRectangleCorners'](1)).toEqual([{x: 0, y: 0}, {x: DEFAULT_CANVAS_WIDTH / 2, y: DEFAULT_CANVAS_HEIGHT / 2}]);
       expect(service['getRectangleCorners'](4)).toEqual([{x: DEFAULT_CANVAS_WIDTH / 2, y: DEFAULT_CANVAS_HEIGHT / 2}, {x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT}]);


       service['subdivision'] = SECOND_SUBDIVISION;
       service['rectangleWidth'] = DEFAULT_CANVAS_WIDTH / SECOND_SUBDIVISION;
       service['rectangleHeight'] = DEFAULT_CANVAS_HEIGHT / SECOND_SUBDIVISION;
       expect(service['getRectangleCorners'](1)).toEqual([{x: 0, y: 0}, {x: DEFAULT_CANVAS_WIDTH / 4, y: DEFAULT_CANVAS_HEIGHT / 4}]);
       expect(service['getRectangleCorners'](16)).toEqual([{x: 3 * DEFAULT_CANVAS_WIDTH / 4, y: 3 * DEFAULT_CANVAS_HEIGHT / 4}, {x: DEFAULT_CANVAS_WIDTH, y: DEFAULT_CANVAS_HEIGHT}]);
    });

    it('getRectangleCorners should return correct corners based on quadrant number entered', () => {
        service['subdivision'] = FIRST_SUBDIVISION;
        service['rectangleWidth'] = DEFAULT_CANVAS_WIDTH / FIRST_SUBDIVISION;
        service['rectangleHeight'] = DEFAULT_CANVAS_HEIGHT / FIRST_SUBDIVISION;
        expect(service['computeQuadrant']({x: 0, y: 0})).toEqual(1);
        expect(service['computeQuadrant']({x: DEFAULT_CANVAS_WIDTH / 2 + 1, y: 0})).toEqual(2);
        expect(service['computeQuadrant']({x: DEFAULT_CANVAS_WIDTH / 2 + 1, y: DEFAULT_CANVAS_HEIGHT - 1})).toEqual(4);
        expect(service['computeQuadrant']({x: 0, y: DEFAULT_CANVAS_HEIGHT - 1})).toEqual(3);
 
        service['subdivision'] = SECOND_SUBDIVISION;
        service['rectangleWidth'] = DEFAULT_CANVAS_WIDTH / SECOND_SUBDIVISION;
        service['rectangleHeight'] = DEFAULT_CANVAS_HEIGHT / SECOND_SUBDIVISION;
        expect(service['computeQuadrant']({x: 0, y: 0})).toEqual(1);
        expect(service['computeQuadrant']({x: DEFAULT_CANVAS_WIDTH / 4 + 1, y: 0})).toEqual(2);
        expect(service['computeQuadrant']({x: DEFAULT_CANVAS_WIDTH - 1, y: DEFAULT_CANVAS_HEIGHT - 1})).toEqual(16);
        expect(service['computeQuadrant']({x: 0, y: DEFAULT_CANVAS_HEIGHT - 1})).toEqual(13);
     });

    it('should call displayClue when clue event is received', () => {
        spyOn<any>(service, "displayClue").and.callFake(()=>{});
        socketHelper.peerSideEmit('clue', JSON.stringify([{} as Coordinate]));
        expect(service['displayClue']).toHaveBeenCalled();
    });

    it('displayThirdClue should call drawCircle 3 times', fakeAsync(() => {
        const drawCircleSpy = spyOn<any>(service['drawService'], "drawCircle").and.callFake(()=>{});
        service['displayThirdClue']({x: 1, y: 6});
        jasmine.clock().tick(THIRD_CLUE_TIMEOUT * 4 + 1);
        expect(drawCircleSpy).toHaveBeenCalledTimes(4);
    }));
});
