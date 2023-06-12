import { ElementRef, Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import {
    GAIN_MAX_VALUE,
    GAIN_MIN_VALUE,
    GameConstants,
    INITIAL_MAX_VALUE,
    INITIAL_MIN_VALUE,
    PENALTY_MAX_VALUE,
    PENALTY_MIN_VALUE,
} from '@common/game-constants';
import { Message } from '@common/message';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_TIMES } from './input-validation.service.constants';

@Injectable({
    providedIn: 'root',
})
export class InputValidationService {
    constants: GameConstants;
    private previousConstants: GameConstants;
    private initialInputIsInvalid: boolean;
    private penaltyInputIsInvalid: boolean;
    private gainInputIsInvalid: boolean;

    constructor(private socketService: SocketClientService, private communicationService: CommunicationService) {
        this.constants = { initial: DEFAULT_TIMES.initial, penalty: DEFAULT_TIMES.penalty, gain: DEFAULT_TIMES.gain };
        this.handleSocket();
        this.fetchConstants();
        this.copyConstants();
    }

    removeAllFirstZeroes(elemRef: HTMLInputElement): void {
        while (elemRef.value.startsWith('0') && elemRef.value.length > 1) {
            elemRef.value = elemRef.value.substring(1);
        }
    }

    validateKeyPress(event: KeyboardEvent): boolean {
        return event.key >= '0' && event.key <= '9';
    }

    verifyInitial(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.initialInputIsInvalid =
            Number(elemRef.nativeElement.value) < INITIAL_MIN_VALUE || Number(elemRef.nativeElement.value) > INITIAL_MAX_VALUE;
    }

    verifyPenalty(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.penaltyInputIsInvalid =
            Number(elemRef.nativeElement.value) < PENALTY_MIN_VALUE || Number(elemRef.nativeElement.value) > PENALTY_MAX_VALUE;
    }

    verifyGain(elemRef: ElementRef<HTMLInputElement>): void {
        this.removeAllFirstZeroes(elemRef.nativeElement);
        this.gainInputIsInvalid = Number(elemRef.nativeElement.value) < GAIN_MIN_VALUE || Number(elemRef.nativeElement.value) > GAIN_MAX_VALUE;
    }

    constantsAreInvalid(): boolean {
        return this.initialInputIsInvalid || this.penaltyInputIsInvalid || this.gainInputIsInvalid;
    }

    resetValues(): void {
        this.constants = { initial: DEFAULT_TIMES.initial, penalty: DEFAULT_TIMES.penalty, gain: DEFAULT_TIMES.gain };
        this.initialInputIsInvalid = false;
        this.penaltyInputIsInvalid = false;
        this.gainInputIsInvalid = false;
        this.setConstants();
    }

    constantsAreDifferentFromPrevious(): boolean {
        return (
            this.previousConstants.gain !== this.constants.gain ||
            this.previousConstants.initial !== this.constants.initial ||
            this.previousConstants.penalty !== this.constants.penalty
        );
    }

    async setConstants() {
        if (this.constantsAreDifferentFromPrevious() && !this.constantsAreInvalid()) {
            await firstValueFrom(
                this.communicationService.postRequest('card/constants', { title: 'constants', body: JSON.stringify(this.constants) } as Message),
            );
            this.copyConstants();
        }
    }

    private handleSocket() {
        this.socketService.addCallbackToMessage(
            'constantsChanged',
            (constants) => {
                this.constants = JSON.parse(constants as string) as GameConstants;
                this.copyConstants();
            },
            false,
        );
    }

    private async fetchConstants() {
        this.constants = JSON.parse((await firstValueFrom(this.communicationService.getRequest('card/constants'))).body);
        this.copyConstants();
    }

    private copyConstants(): void {
        this.previousConstants = { ...this.constants };
    }
}
