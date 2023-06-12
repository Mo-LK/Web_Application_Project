/* eslint-disable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SoundService } from '@app/services/sound/sound.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ViewManipulatorService } from '@app/services/view-manipulator/view-manipulator.service';
import { Card } from '@common/card';
import { CardStats } from '@common/card-stats';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { Message } from '@common/message';
import { SuccessClick } from '@common/success-click';
import { Winner } from '@common/winner';
import { Observable, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { FirstGameMode } from '../card-selection-change/card-selection-change.service.constants';
import { CLUE_TIMEOUT } from '../game-clues/game-clues.service.constants';
import { VideoReplayService } from '../video-replay/video-replay.service';
import { GameService } from './game.service';

const fakeFunc: () => Promise<void> = async () => {
    await new Promise<void>((resolve) => resolve());
};

const fakeFunc1 = async () => {
    return await new Promise<boolean>((resolve) => resolve(true));
};

describe('GameService', () => {
    let service: GameService;
    let mouseService: MouseService;
    let viewService: ViewManipulatorService;
    let comService: CommunicationService;
    let videoService: VideoReplayService;
    let soundService: SoundService;
    let playerService: PlayerService;
    let defaultCard: Card;
    let socketService: SocketClientService;
    let router: Router;
    let socketHelper: SocketTestHelper;  
    
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
            
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [GameService, MouseService, TimerService, ViewManipulatorService, CommunicationService, SoundService, PlayerService, SocketClientService],
            schemas: [NO_ERRORS_SCHEMA]
        });
       
        jasmine.clock().uninstall();
        jasmine.clock().install();
        service = TestBed.inject(GameService);
        soundService = TestBed.inject(SoundService);
        mouseService = TestBed.inject(MouseService);
        viewService = TestBed.inject(ViewManipulatorService);
        comService = TestBed.inject(CommunicationService);
        videoService = TestBed.inject(VideoReplayService);
        playerService = TestBed.inject(PlayerService);
        router = TestBed.inject(Router);
        socketService = TestBed.inject(SocketClientService);
        defaultCard = {
            enlargementRadius: 13,
            differences: [],
            title: 'hey',
            stats: {} as unknown as CardStats,
            difficultyLevel: 'facile',
            id: 'de',
        };

        spyOn(service['socketService'], 'connect').and.callFake(() => {service['socketService']['gameSocket'] = socketHelper as unknown as Socket;});
        spyOn(service['socketService'], 'addCallbackToMessage').and.callFake((event: any, callback: any) =>{
            socketHelper.on(event, callback);
        });
        spyOn(router, "navigate").and.callFake(fakeFunc1);
        spyOn(soundService, 'success').and.callFake(()=>{});
        spyOn<any>(videoService, 'register').and.callFake(() => {});
        service['handleSocket']();
        service['socketService'].connect();

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call handleClueEvent when clue event is received', () => {
        spyOn<any>(service, "handleClueEvent").and.callFake(()=>{});
        socketHelper.peerSideEmit("clue");
        expect(service['handleClueEvent']).toHaveBeenCalled();
    });

    it('should call handleSuccess when success event is received', () => {
        const cardId = 'hello';
        spyOn<any>(service, "handleSucess").and.callFake(()=>{});
        socketHelper.peerSideEmit("success", cardId);
        expect(service['handleSucess']).toHaveBeenCalledWith(cardId);
    });

    it('should set gameConstants to false when constants event is received', () => {
        const constants = {initial: 1, gain: 4, penalty: 3} as GameConstants;
        socketHelper.peerSideEmit("constants", JSON.stringify(constants));
        expect(service['gameConstants']).toEqual(constants);
    });

    it('should set isMultiplayer to false when playerQuit event is received', () => {
        socketHelper.peerSideEmit("playerQuit");
        expect(service['isMultiplayer']).toEqual(false);
    });

    it('should call handleCardChange when cardChange event is received', () => {
        const card = {id: 'id'} as unknown as Card;
        spyOn<any>(service, "handleCardChange").and.callFake(()=>{});
        socketHelper.peerSideEmit("cardChange", JSON.stringify(card));
        expect(service['handleCardChange']).toHaveBeenCalledWith(card);
    });
    
    it('should call handleEndGame when endGame event is received', () => {
        spyOn<any>(service, "handleEndGame").and.callFake(()=>{});
        socketHelper.peerSideEmit("endGame", JSON.stringify(true));
        expect(service['handleEndGame']).toHaveBeenCalledWith(true);
    });

    it('should call handleError when success event is received', () => {
        spyOn<any>(service, "handleError").and.callFake(()=>{});
        socketHelper.peerSideEmit("error");
        expect(service['handleError']).toHaveBeenCalled();
    });

    it('should call updateTime when clock event is received', () => {
        spyOn<any>(service['timeService'], "updateTime").and.callFake(()=>{});
        socketHelper.peerSideEmit("clock", 103);
        expect(service['timeService'].updateTime).toHaveBeenCalledWith(103);
    });

    it('should call handleWinner when winner event is received', () => {
        spyOn<any>(service, "handleWinner").and.callFake(()=>{});
        const winnerData = {socketId: 'id', leaderboardPosition: 3} as Winner;
        socketHelper.peerSideEmit("winner", JSON.stringify(winnerData));
        expect(service['handleWinner']).toHaveBeenCalledWith(winnerData);
    });

    it('loadGame should set game information', () => {
        const game: Game = { id: 'id', gameTitle: 'Titre', firstMode: 'Classique', secondMode: 'solo', difficulty: 'facile', differences: [], differencesBackup: [] } as Game;
        service.loadGame(game);
        expect(service["game"].gameTitle).toEqual('Titre');
        expect(service["game"].firstMode).toEqual('Classique');
        expect(service["game"].secondMode).toEqual('solo');
        expect(service["game"].differences).toEqual([]);
    });

    it('startGame should call toggleclick with false, resetGame, enableTListenner', async () => {
        const response1: Message = { title: 'title', body: JSON.stringify(defaultCard) };
        const responseMessage1: Observable<Message> = of(response1);
        spyOn(comService, "getRequest").and.returnValue(responseMessage1);
        spyOn(mouseService, 'toggleClick');
        spyOn<any>(service, 'resetGame');
        spyOn(service, 'enableKeyListener');
        await service.startGame();
        expect(mouseService.toggleClick).toHaveBeenCalledWith(false);
        expect(service["resetGame"]).toHaveBeenCalled();
        expect(service.enableKeyListener).toHaveBeenCalled();
    });

    it('startGame should reset differences to backup if video replay mode is on', async () => {
        videoService['isReplaying'] = true;
        const response1: Message = { title: 'title', body: JSON.stringify(defaultCard) };
        const responseMessage1: Observable<Message> = of(response1);
        const differences = [[{x: 0, y: 1}, {x: 0, y: 2}], [{x: 1, y: 1}, {x: 1, y: 1}]];
        service['game'].differencesBackup = differences;
        spyOn(comService, "getRequest").and.returnValue(responseMessage1);
        spyOn(mouseService, 'toggleClick');
        spyOn<any>(service, 'resetGame');
        spyOn(service, 'enableKeyListener');
        await service.startGame();
        expect(service['game'].differences).toEqual(differences);
        expect(comService.getRequest).not.toHaveBeenCalled();
        expect(mouseService.toggleClick).toHaveBeenCalledWith(false);
        expect(service["resetGame"]).toHaveBeenCalled();
        expect(service.enableKeyListener).toHaveBeenCalled();
    });

    it('abandonGame should call  resetGame', () => {
        spyOn<any>(service, 'resetGame').and.callFake(()=>{});
        service.abandonGame();
        expect(service["resetGame"]).toHaveBeenCalled();
    });

    it('abandonGame should send surrender if surrender is true', () => {
        spyOn<any>(service["socketService"], 'send').and.callFake(()=>{});
        service.abandonGame(true);
        expect(service["socketService"].send).toHaveBeenCalledWith('surrender');
    });

    it('restart should send call resetCounter and restart', () => {
        spyOn<any>(service["playerService"], 'resetCounter').and.callFake(()=>{});
        spyOn<any>(service["videoReplayService"], 'restart').and.callFake(()=>{});
        service.restart();
        expect(service["videoReplayService"].restart).toHaveBeenCalled();
        expect(service["playerService"].resetCounter).toHaveBeenCalled();
    });

    it('deactivate cheat mode should call clearInterval with intervalIdCheatMode and resetModImage with differenceFoundPositions', () => {
        service["intervalIdCheatMode"] = 1;
        service["differenceFoundPositions"] = [];
        spyOn(viewService, 'resetModImage').and.callFake(fakeFunc);
        spyOn(window, "clearInterval").and.callFake(()=>{});
        const speed = 2;
        service["deactivateCheatMode"](speed);
        expect(window.clearInterval).toHaveBeenCalledWith(1);
        expect(viewService.resetModImage).toHaveBeenCalledWith(service["differenceFoundPositions"], speed);
    });

    it('toggleCheatMode should call deactivateCheat mode if cheatMode is true, activateCheatMode otherwise and should change cheatMode value to opposite of current', () => {
        service["cheatMode"] = true;
        spyOn<any>(service, "activateCheatMode").and.callFake(()=>{});
        spyOn<any>(service, "deactivateCheatMode").and.callFake(()=>{});
        service["toggleCheatMode"]();
        expect(service["deactivateCheatMode"]).toHaveBeenCalled();
        expect( service["cheatMode"]).toEqual(false);
        service["toggleCheatMode"]();
        expect(service["activateCheatMode"]).toHaveBeenCalled();
        expect( service["cheatMode"]).toEqual(true);
    });

    it('activateCheatMode should setInterval and call blinkPixels after', fakeAsync(() => {
        service["videoReplayService"]["isReplaying"] = true;
        service["videoReplayService"]["isPaused"] = false;
        service["game"].differences = [[{x: 0, y: 0}]];
        spyOn(service["viewService"], "blinkPixels");
        service["activateCheatMode"]();
        jasmine.clock().tick(250);
        expect(service["viewService"].blinkPixels).toHaveBeenCalled();
        clearInterval(service["intervalIdCheatMode"]);
    }));

    it('catchEvent call toggleCheatMode if keyEvent is letter t and not if not t', () => {
        spyOn<any>(service, "toggleCheatMode").and.callFake(()=>{});
        service["catchEvent"]({key: "t"} as KeyboardEvent);
        service["catchEvent"]({key: "f"} as KeyboardEvent);
        expect(service["toggleCheatMode"]).toHaveBeenCalledTimes(1);
    });

    it('handleClueEvent should setTimeout of 3 seconds and call resetModImage', fakeAsync(() => {
        spyOn<any>(service['viewService'], "resetModImage").and.callFake(()=>{});
        service['handleClueEvent']();
        jasmine.clock().tick(CLUE_TIMEOUT);
        expect(service['viewService'].resetModImage).toHaveBeenCalled();
    }));

    it('catchEvent should send clue event if keyEvent is i and isMultiplayer is false', () => {
        spyOn<any>(socketService, "send").and.callFake(()=>{});
        service["catchEvent"]({key: "i"} as KeyboardEvent);
        service["catchEvent"]({key: "j"} as KeyboardEvent);
        expect(socketService["send"]).toHaveBeenCalledTimes(1);
        expect(socketService["send"]).toHaveBeenCalledWith('clue');
    });

    it('setErrorPosition should not set the error position if an error is displayed', () => {
        const newErrorPosition = {x: 1, y: 2};
        const initialErrorPosition = {x: 0, y: 0};
        service.errorVisibility = true;
        service.errorPosition = initialErrorPosition;
        service['setErrorPosition'](newErrorPosition.x, newErrorPosition.y);
        expect(service.errorPosition).toEqual(initialErrorPosition);
    });

    it('setErrorPosition should not set the error position if an error is displayed', () => {
        const newErrorPosition = {x: 1, y: 2};
        const initialErrorPosition = {x: 0, y: 0};
        service.errorVisibility = false;
        service.errorPosition = initialErrorPosition;
        service['setErrorPosition'](newErrorPosition.x, newErrorPosition.y);
        expect(service.errorPosition).toEqual(newErrorPosition);
    });

    it('findIndex should return index of corresponding array in game.differences array', () => {
        service["game"].differences = [[{x: 0, y:1}, {x: 0, y: 31}], [{x: 2, y: 41}]];
        const index = service["findIndex"]([{x:2, y:41}]);
        expect(index).toEqual(1);
    });

    it('handleSucess should play success if player name is the one coming from server', () => {
        const differenceArr = [
            { x: 1, y: 0 } as Coordinate,
            { x: 0, y: 78 } as Coordinate,
        ];
        const playerName = "test";
        socketService['gameSocket'].id = playerName;
        service["cheatMode"] = false;
        const game = { id: '0', gameTitle: 'GameTest', firstMode: 'classique', secondMode: 'solo', difficulty: 'facile', differences: [differenceArr], differencesBackup: [differenceArr] };
        const data = JSON.stringify({socketId: playerName, differences: differenceArr} as SuccessClick);
        service.loadGame(game);
        service["playerService"].initializeSelf(playerName);
        spyOn(viewService, 'activateBlinkingAnimation').and.callFake(fakeFunc);
        spyOn(playerService, 'incrementPlayerDiffCount').and.callFake(() => {});
        service["handleSucess"](data);
        expect(soundService.success).toHaveBeenCalled();
        expect(playerService.incrementPlayerDiffCount).toHaveBeenCalledWith(true);
        expect(viewService.activateBlinkingAnimation).toHaveBeenCalledWith(JSON.parse(data).differences);
        expect(service["differenceFoundPositions"]).toEqual([JSON.parse(data).differences]);
        expect(service["game"].differences).toEqual([]);
    });

    it('handleSucess should not call blinkPixelsAnimation if cheat mode is on', () => {
        const differenceArr = [
            { x: 1, y: 0 } as Coordinate,
            { x: 0, y: 78 } as Coordinate,
        ];
        const playerName = "test";
        socketService['gameSocket'].id = playerName;
        service["cheatMode"] = true;
        const game = { id: '0', gameTitle: 'GameTest', firstMode: 'classique', secondMode: 'solo', difficulty: 'facile', differences: [differenceArr], differencesBackup: [differenceArr] };
        const data = JSON.stringify({socketId: playerName, differences: differenceArr} as SuccessClick);
        service.loadGame(game);
        service["playerService"].initializeSelf(playerName);
        spyOn(viewService, 'activateBlinkingAnimation').and.callFake(fakeFunc);
        spyOn(playerService, 'incrementPlayerDiffCount').and.callFake(() => {});
        service["handleSucess"](data);
        expect(soundService.success).toHaveBeenCalled();
        expect(playerService.incrementPlayerDiffCount).toHaveBeenCalledWith(true);
        expect(viewService.activateBlinkingAnimation).not.toHaveBeenCalled();
        expect(service["differenceFoundPositions"]).toEqual([JSON.parse(data).differences]);
        expect(service["game"].differences).toEqual([]);
    });

    it('handleSucess should increment other player count if info coming from server is not self name', () => {
        const differenceArr = [
            { x: 1, y: 0 } as Coordinate,
            { x: 0, y: 78 } as Coordinate,
        ];
        const playerName = "test";
        service["socketService"]['gameSocket'].id = 'pddlayerName';
        service["cheatMode"] = true;
        const game = { id: '0', gameTitle: 'GameTest', firstMode: 'classique', secondMode: 'solo', difficulty: 'facile', differences: [differenceArr], differencesBackup: [differenceArr] };
        const data = JSON.stringify({socketId: "playerName", differences: differenceArr} as SuccessClick);
        service.loadGame(game);
        service["playerService"].initializeSelf(playerName);
        spyOn(playerService, 'incrementPlayerDiffCount').and.callFake(() => {});
        service["handleSucess"](data);
        expect(playerService.incrementPlayerDiffCount).toHaveBeenCalledWith(false);
        expect(service["differenceFoundPositions"]).toEqual([JSON.parse(data).differences]);
        expect(service["game"].differences).toEqual([]);
    });

    it('handleSucess should not activateBlinkingAnimation if is not classic mode', () => {
        spyOn(viewService, 'activateBlinkingAnimation').and.callFake(fakeFunc);
        service['game']['firstMode'] = FirstGameMode.LIMITED_TIME;
        service['handleSucess']('{}');
        expect(viewService.activateBlinkingAnimation).not.toHaveBeenCalled();

    });

    it('validate difference should send to event "click" with mousePosition', () => {
        const mousePos = { x: 1, y: 0 } as Coordinate;
        spyOn(service['socketService'], 'send').and.callFake(()=>{});
        spyOn(mouseService, "mouseHitDetect").and.returnValue(mousePos);
        service.validateDifference({} as unknown as MouseEvent);
        expect(mouseService.mouseHitDetect).toHaveBeenCalled();
        expect(service['socketService'].send).toHaveBeenCalledWith('handleClick', JSON.stringify(mousePos));
    });

    it('enableTListenner should add eventListenner to letter t', () => {
        spyOn<any>(service, "catchEvent").and.callFake(()=>{});
        service.enableKeyListener();
        window.dispatchEvent(new Event('keydown'));
        expect(service["catchEvent"]).toHaveBeenCalled();
    });

    it('handleSucess should play error and disable click', () => {
        spyOn(soundService, 'error').and.callFake(() => {});
        spyOn(mouseService, "toggleClick").and.callFake(()=>{});
        service["handleError"]();
        expect(soundService.error).toHaveBeenCalled();
        expect(mouseService.toggleClick).toHaveBeenCalledWith(true);
    });

    it('handleSucess should enable click after 1000ms', fakeAsync(() => {
        spyOn(soundService, 'error').and.callFake(() => {});
        spyOn(mouseService, "toggleClick").and.callFake(()=>{});
        service["handleError"]();
        jasmine.clock().tick(1002);
        expect(soundService.error).toHaveBeenCalled();
        expect(mouseService.toggleClick).toHaveBeenCalledWith(false);
    }));

    it('enterGame should call startGame and navigate', () => {
        spyOn(service, 'startGame').and.callFake(fakeFunc);
        spyOn(service, 'navigate').and.callFake(()=>{});
        service.enterGame();
        expect(service.startGame).toHaveBeenCalled();
        expect(service.navigate).toHaveBeenCalled();
    });

    it('navigate should navigate to route', () => {
        service.navigate('/test');
        expect(router.navigate).toHaveBeenCalledWith(['/test']);
    });

    it('handleWinner should toggle click to true', () => {
        spyOn(mouseService, 'toggleClick').and.callFake(()=>{});
        const winnerData = {socketId: 'id', leaderboardPosition: 3} as Winner;
        service['handleWinner'](winnerData);
        expect(mouseService.toggleClick).toHaveBeenCalledWith(true);
    });

    it('disableTListener should call removeEventListenner', () => {
        spyOn(window, 'removeEventListener');
        service.disableKeyListener();
        expect(window.removeEventListener).toHaveBeenCalled();  
    });

    it('registerEvent should call register from videoReplayService', () => {
        const gameEvent = {this: service, method: service.registerEvent, timestamp: Date.now()};
        service.registerEvent(gameEvent);
        expect(videoService.register).toHaveBeenCalledWith(gameEvent);  
    });

    it('difficulty getter should return game difficulty', () => {
        const game: Game = { id: 'id', gameTitle: 'Titre', firstMode: 'Classique', secondMode: 'solo', difficulty: 'facile', differences: [], differencesBackup: [] } as Game;
        service.loadGame(game);
        expect(service.gameData.difficulty).toEqual('facile');
    });

    it('gameIsWon getter should return if we won', () => {
        service['isWinner'] = true;
        expect(service.gameIsWon).toEqual(true);
    });

    it('initializeSelf should call playerService.initializeSelf', () => {
        spyOn(playerService, 'initializeSelf');
        service.initializeSelf('hey');
        expect(playerService.initializeSelf).toHaveBeenCalledWith('hey');
    });

    it('initializeOpponent should call playerService.initializeOpponent', () => {
        spyOn(playerService, 'initializeOpponent');
        service.initializeOpponent('hey');
        expect(playerService.initializeOpponent).toHaveBeenCalledWith('hey');
    });

    it('getOpponentDiffCount should return opponent differrence count', () => {
        service.initializeOpponent('hey');
        expect(service.opponentDiffCount).toEqual(0);
    });

    it('handleCardChange should set new card', () => {
        const card = {id: 'id', title: 'title', difficultyLevel: 'hard', differences: 'diff'} as unknown as Card;
        const game = {id: card.id, gameTitle: card.title, difficulty: card.difficultyLevel,firstMode: 'Temps limité', differences: card.differences} as unknown as Game;
        service['handleCardChange'](card);
        expect(service['game']).toEqual(game);
    });

    it('handleEndGame should set isWinner to parameter and endGame', () => {
        service['isWinner'] = false;
        spyOn<any>(service, 'endGame').and.callFake(()=>{});
        service['handleEndGame'](true);
        expect(service.gameIsWon).toEqual(true);
        expect(service['endGame']).toHaveBeenCalled();
    });

    it('isClassicMode should return if game is classic or not', () => {
        service['game']['firstMode'] = FirstGameMode.CLASSIC;
        expect(service.isClassicMode).toEqual(true);
        service['game']['firstMode'] = FirstGameMode.LIMITED_TIME;
        expect(service.isClassicMode).toEqual(false);
    });

    it('replay should call replay from video replay service', () => {
        const replaySpy = spyOn<any>(videoService, 'replay').and.callFake(() => {});
        service.replay();
        expect(replaySpy).toHaveBeenCalled();
    });

    it('waitForCardValidity should wait for card id to be valid to call joinGame', fakeAsync(() => {
        service.gameData.id = FirstGameMode.LIMITED_TIME;
        spyOn(service, 'navigate').and.callFake(() => {});
        window.setTimeout(() => {
            service.gameData.id = 'id';
        }, 1000);
        service['waitForCardValidity']();
        jasmine.clock().tick(1200);
        expect(service.navigate).toHaveBeenCalledWith('/game');
    }));
});
