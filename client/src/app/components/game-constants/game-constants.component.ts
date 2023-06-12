import { Component, ElementRef, ViewChild } from '@angular/core';
import { InputValidationService } from '@app/services/input-validation/input-validation.service';
import { DEFAULT_TIMES } from '@app/services/input-validation/input-validation.service.constants';
import { GAIN_MAX_VALUE, GAIN_MIN_VALUE, INITIAL_MAX_VALUE, INITIAL_MIN_VALUE, PENALTY_MAX_VALUE, PENALTY_MIN_VALUE } from '@common/game-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent {
    @ViewChild('initial') initialRef: ElementRef<HTMLInputElement>;
    @ViewChild('penalty') penaltyRef: ElementRef<HTMLInputElement>;
    @ViewChild('gain') gainRef: ElementRef<HTMLInputElement>;
    defaultValuesMessage: string;

    initialDescription: string;
    initialMinValue = INITIAL_MIN_VALUE;
    initialDefaultValue = DEFAULT_TIMES.initial;
    initialMaxValue = INITIAL_MAX_VALUE;
    initialErrorMessage: string;

    penaltyDescription: string;
    penaltyMinValue = PENALTY_MIN_VALUE;
    penaltyDefaultValue = DEFAULT_TIMES.penalty;
    penaltyMaxValue = PENALTY_MAX_VALUE;
    penaltyErrorMessage: string;

    gainDescription: string;
    gainMinValue = GAIN_MIN_VALUE;
    gainDefaultValue = DEFAULT_TIMES.gain;
    gainMaxValue = GAIN_MAX_VALUE;
    gainErrorMessage: string;

    constructor(protected inputValidationService: InputValidationService) {
        // defaultValuesMessage has to have this format to be able to use the interpolation and display properly
        this.defaultValuesMessage = `Remettre les valeurs par défaut 
(initial: ${DEFAULT_TIMES.initial}, pénalité: ${DEFAULT_TIMES.penalty} et gagné: ${DEFAULT_TIMES.gain})`;
        this.initialDescription = 'Temps initial du compte à rebours en mode Temps limité';
        this.initialErrorMessage = `Valeur entre ${INITIAL_MIN_VALUE} et ${INITIAL_MAX_VALUE} secondes requise`;
        this.penaltyDescription = 'Temps perdu par indice demandé';
        this.penaltyErrorMessage = `Valeur entre ${PENALTY_MIN_VALUE} et ${PENALTY_MAX_VALUE} secondes requise`;
        this.gainDescription = "Temps gagné par la découverte d'une différence";
        this.gainErrorMessage = `Valeur entre ${GAIN_MIN_VALUE} et ${GAIN_MAX_VALUE} secondes requise`;
    }
}
