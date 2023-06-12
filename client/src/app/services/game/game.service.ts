/* eslint-disable max-lines */
// Disable max lines because file is central to the client and needs all the methods
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { VALIDITY_CHECK_TIMEOUT } from '@app/components/name-query/name-query.component.constants';
import { Game } from '@app/interfaces/game';
import { FirstGameMode } from '@app/services/card-selection-change/card-selection-change.service.constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameCluesService } from '@app/services/game-clues/game-clues.service';
import { CLUE_TIMEOUT } from '@app/services/game-clues/game-clues.service.constants';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SoundService } from '@app/services/sound/sound.service';
import { TimerService } from '@app/services/timer/timer.service';
import { VideoReplayService } from '@app/services/video-replay/video-replay.service';
import { ViewManipulatorService } from '@app/services/view-manipulator/view-manipulator.service';
import { Card } from '@common/card';
import { Coordinate } from '@common/coordinates';
import { GameConstants } from '@common/game-constants';
import { GameEvent } from '@common/game-event';
import { SuccessClick } from '@common/success-click';
import { Winner } from '@common/winner';
import { Subject, firstValueFrom } from 'rxjs';
import { BLINK_ANIMATION_TIME, DEFAULT_LEADERBOARD_POSITION, ERROR_WAIT_TIME, GAME_CONSTANTS_DEFAULT } from './game.service.constants';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    errorPosition: Coordinate;
    errorVisibility: boolean;
    lobbyWaitingVisibility: boolean;
    endPopUpSubject: Subject<boolean>;
    videoGameControlsAreVisible: boolean;
    leaderboardPosition: number;
    gameConstants: GameConstants;
    isMultiplayer: boolean;
    deleteMessage: number;
    private game: Game;
    private differenceFoundPositions: Coordinate[][];
    private intervalIdCheatMode: number;
    private eventListenerRef: (this: Window, ev: KeyboardEvent) => unknown;
    private cheatMode: boolean;
    private isWinner: boolean;
    private endPopUpVisibility: boolean;

    // Disable lint because this is main service and require all other services
    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private communicationService: CommunicationService,
        private soundService: SoundService,
        private viewService: ViewManipulatorService,
        private playerService: PlayerService,
        private timeService: TimerService,
        private socketService: SocketClientService,
        private videoReplayService: VideoReplayService,
        private router: Router,
        private clueService: GameCluesService,
    ) {
        this.game = { id: '', gameTitle: '', firstMode: '', secondMode: '', difficulty: '', differences: [], differencesBackup: [] };
        this.differenceFoundPositions = [];
        this.cheatMode = false;
        this.errorVisibility = false;
        this.endPopUpVisibility = false;
        this.endPopUpSubject = new Subject<boolean>();
        this.videoGameControlsAreVisible = false;
        this.gameConstants = GAME_CONSTANTS_DEFAULT;
        this.deleteMessage = 0;
        this.handleSocket();
    }

    get gameData() {
        return this.game;
    }

    get isClassicMode() {
        return this.game.firstMode === FirstGameMode.CLASSIC;
    }

    get selfName() {
        return this.playerService.selfName;
    }

    get opponentName() {
        return this.playerService.opponentName;
    }

    get selfDiffCount() {
        return this.playerService.selfDiffCount;
    }

    get opponentDiffCount() {
        return this.playerService.opponentDiffCount;
    }

    get gameIsWon() {
        return this.isWinner;
    }

    async replay(): Promise<void> {
        this.setEndPopUpVisibility(false);
        this.playerService.resetCounter();
        this.videoReplayService.replay();
    }

    async restart(): Promise<void> {
        this.playerService.resetCounter();
        this.videoReplayService.restart();
    }

    initializeSelf(name: string) {
        this.playerService.initializeSelf(name);
    }

    initializeOpponent(name: string) {
        this.playerService.initializeOpponent(name);
    }

    loadGame(game: Game) {
        this.game = game;
    }

    enterGame(selfName: string = 'Moi', opponentName: string = 'Adversaire') {
        this.initializeSelf(selfName);
        this.initializeOpponent(opponentName);
        this.startGame(true, this.isClassicMode);
        this.lobbyWaitingVisibility = true;
        this.waitForCardValidity();
    }

    navigate(route: string) {
        this.router.navigate([route]);
    }

    waitForCardValidity() {
        // Algorithm source : https://stackoverflow.com/questions/22125865/how-to-wait-until-a-predicate-condition-becomes-true-in-javascript
        if (this.gameData.id === FirstGameMode.LIMITED_TIME) {
            window.setTimeout(this.waitForCardValidity.bind(this), VALIDITY_CHECK_TIMEOUT);
        } else {
            this.lobbyWaitingVisibility = false;
            this.navigate('/game');
        }
    }

    async startGame(isMultiplayer: boolean = false, isClassic: boolean = true) {
        if (!this.videoReplayService.isInReplayMode) this.lobbyWaitingVisibility = true;
        this.registerEvent({ this: this, method: this.startGame, params: [isMultiplayer, isClassic], timestamp: Date.now() });
        this.isMultiplayer = isMultiplayer;
        this.leaderboardPosition = DEFAULT_LEADERBOARD_POSITION;
        this.resetGame();
        if (isClassic && !this.videoReplayService.isInReplayMode) {
            this.timeService.updateTime(0);
            const gameData = await firstValueFrom(this.communicationService.getRequest(`card/${this.game.id}`));
            this.game.differences = JSON.parse(gameData.body).differences;
            this.game.differencesBackup = JSON.parse(gameData.body).differences;
        } else if (this.videoReplayService.isInReplayMode) {
            this.game.differences = this.game.differencesBackup;
        }
        this.setEndPopUpVisibility(false);
        this.enableKeyListener();
        this.mouseService.toggleClick(false);
    }

    async validateDifference(event: MouseEvent) {
        const mousePos = this.mouseService.mouseHitDetect(event);
        this.setErrorPosition(event.clientX, event.clientY);
        if (mousePos) this.socketService.send('handleClick', JSON.stringify(mousePos));
    }

    abandonGame(surrender: boolean = false) {
        this.setEndPopUpVisibility(false);
        this.videoGameControlsAreVisible = false;
        if (surrender) this.socketService.send('surrender');
        this.resetGame();
        this.navigate('/home');
    }

    enableKeyListener() {
        this.eventListenerRef = this.catchEvent.bind(this);
        addEventListener('keydown', this.eventListenerRef);
    }

    disableKeyListener() {
        removeEventListener('keydown', this.eventListenerRef);
    }

    registerEvent(gameEvent: GameEvent) {
        this.videoReplayService.register(gameEvent);
    }

    getEndPopUpVisibility() {
        return this.endPopUpVisibility;
    }

    setEndPopUpVisibility(visibility: boolean) {
        if (this.endPopUpVisibility !== visibility) {
            this.endPopUpVisibility = visibility;
            this.endPopUpSubject.next(this.endPopUpVisibility);
        }
    }

    resetGame() {
        this.differenceFoundPositions = [];
        this.errorVisibility = false;
        this.setEndPopUpVisibility(false);
        this.cheatMode = false;
        this.clueService.resetClueCount();
        this.mouseService.toggleClick(false);
        this.disableKeyListener();
        this.deactivateCheatMode();
    }

    private setErrorPosition(x: number, y: number) {
        this.registerEvent({ this: this, method: this.setErrorPosition, params: [x, y], timestamp: Date.now() });
        if (!this.errorVisibility) this.errorPosition = { x, y };
    }

    private findIndex(array: Coordinate[]): number {
        let counter = 0;
        let index = 0;
        this.game.differences.forEach((diffArr) => {
            if (diffArr.length === array.length && JSON.stringify(diffArr[0]) === JSON.stringify(array[0])) {
                index = counter;
            }
            counter++;
        });
        return index;
    }

    private catchEvent(event: KeyboardEvent) {
        if (event.key === 't') {
            this.toggleCheatMode();
        } else if (event.key === 'i' && !this.isMultiplayer) {
            if (this.clueService.buttonIsEnable) this.socketService.send('clue');
        }
    }

    private handleClueEvent() {
        this.viewService.displayQuadrant = true;
        const timeoutId = window.setTimeout(() => {
            this.viewService.displayQuadrant = false;
            this.viewService.resetModImage(this.differenceFoundPositions);
        }, CLUE_TIMEOUT);
        this.videoReplayService.addClueTimeoutId(timeoutId);
    }

    private toggleCheatMode(speed: number = 1) {
        this.registerEvent({ this: this, method: this.toggleCheatMode, timestamp: Date.now() });
        if (this.cheatMode) {
            this.deactivateCheatMode(speed);
        } else {
            this.activateCheatMode(speed);
        }
        this.cheatMode = !this.cheatMode;
    }

    private activateCheatMode(speed: number = 1) {
        this.intervalIdCheatMode = window.setInterval(() => {
            if (!(this.videoReplayService.isInReplayMode && this.videoReplayService.isInPausedState)) {
                this.game.differences.forEach((diffArr) => {
                    this.viewService.blinkPixels(diffArr, speed);
                });
            }
        }, BLINK_ANIMATION_TIME);
    }

    private deactivateCheatMode(speed: number = 1) {
        if (this.intervalIdCheatMode) {
            window.clearInterval(this.intervalIdCheatMode);
            this.viewService.resetModImage(this.differenceFoundPositions, speed);
        }
    }

    private handleSucess(data: string) {
        const successInfo = JSON.parse(data) as SuccessClick;
        const isSelfSuccess = this.isClassicMode ? successInfo.socketId === this.socketService.socketId : true;
        this.soundService.success();
        this.playerService.incrementPlayerDiffCount(isSelfSuccess);
        if (this.isClassicMode) {
            if (!this.cheatMode) this.viewService.activateBlinkingAnimation(successInfo.differences);
            this.differenceFoundPositions.push(successInfo.differences);
            this.game.differences.splice(this.findIndex(successInfo.differences), 1);
        }
    }

    private handleError() {
        this.errorVisibility = true;
        this.soundService.error();
        this.mouseService.toggleClick(true);
        setTimeout(() => {
            this.mouseService.toggleClick(false);
            this.errorVisibility = false;
        }, ERROR_WAIT_TIME);
    }

    private handleWinner(winnerData: Winner) {
        this.isWinner = winnerData.socketId === this.socketService.socketId;
        this.leaderboardPosition = winnerData.leaderboardPosition;
        this.endGame();
    }

    private handleCardChange(card: Card) {
        this.game = {
            id: card.id,
            gameTitle: card.title,
            firstMode: FirstGameMode.LIMITED_TIME,
            difficulty: card.difficultyLevel,
            differences: card.differences,
        } as Game;
    }

    private endGame() {
        this.resetGame();
        this.setEndPopUpVisibility(true);
        this.mouseService.toggleClick(true);
    }

    private handleEndGame(isWinner: boolean) {
        this.isWinner = isWinner;
        this.endGame();
    }

    private setToSolo() {
        this.isMultiplayer = false;
    }

    private updateConstants(constants: string) {
        this.gameConstants = JSON.parse(constants) as GameConstants;
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage('success', (data) => {
            this.registerEvent({ this: this, method: this.handleSucess, params: [data as string], timestamp: Date.now() });
            this.handleSucess(data as string);
        });
        this.socketService.addCallbackToMessage('error', () => {
            this.registerEvent({ this: this, method: this.handleError, timestamp: Date.now() });
            this.handleError();
        });
        this.socketService.addCallbackToMessage('clock', (data) => {
            this.registerEvent({
                this: this.timeService,
                method: this.timeService.updateTime,
                params: [Math.round(data as number)],
                timestamp: Date.now(),
            });
            this.timeService.updateTime(Math.round(data as number));
        });
        this.socketService.addCallbackToMessage('winner', (data) => {
            this.registerEvent({ this: this, method: this.handleWinner, params: [JSON.parse(data as string) as Winner], timestamp: Date.now() });
            this.handleWinner(JSON.parse(data as string) as Winner);
        });
        this.socketService.addCallbackToMessage('cardChange', (card) => {
            this.registerEvent({ this: this, method: this.handleCardChange, params: [JSON.parse(card as string) as Card], timestamp: Date.now() });
            this.handleCardChange(JSON.parse(card as string) as Card);
        });
        this.socketService.addCallbackToMessage('endGame', (isWinner) => {
            this.registerEvent({
                this: this,
                params: [JSON.parse(isWinner as string) as boolean],
                method: this.handleEndGame,
                timestamp: Date.now(),
            });
            this.handleEndGame(JSON.parse(isWinner as string) as boolean);
        });
        this.socketService.addCallbackToMessage('playerQuit', () => {
            this.registerEvent({ this: this, method: this.setToSolo, timestamp: Date.now() });
            this.setToSolo();
        });
        this.socketService.addCallbackToMessage('constants', (constants) => {
            this.registerEvent({ this: this, method: this.updateConstants, params: [constants as string], timestamp: Date.now() });
            this.updateConstants(constants as string);
        });
        this.socketService.addCallbackToMessage('clue', () => {
            this.registerEvent({ this: this, method: this.handleClueEvent, timestamp: Date.now() });
            this.handleClueEvent();
        });
    }
}
