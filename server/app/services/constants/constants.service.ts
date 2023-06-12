import { FileService } from '@app/services/file/file.service';
import { CONSTANTS_PATH } from '@app/services/file/file.service.constants';
import { Injectable } from '@nestjs/common';
import {
    GameConstants,
    GAIN_MAX_VALUE,
    GAIN_MIN_VALUE,
    INITIAL_MAX_VALUE,
    INITIAL_MIN_VALUE,
    PENALTY_MAX_VALUE,
    PENALTY_MIN_VALUE,
} from '@common/game-constants';

@Injectable()
export class ConstantsService {
    constructor(private fileService: FileService) {}

    setConstants(gameConstants: GameConstants): boolean {
        const isValid = this.verifyConstants(gameConstants);
        if (isValid) this.fileService.write(CONSTANTS_PATH, JSON.stringify(gameConstants));
        return isValid;
    }

    private verifyConstants(constants: GameConstants): boolean {
        const initialValidation = INITIAL_MIN_VALUE <= constants.initial && INITIAL_MAX_VALUE >= constants.initial;
        const gainValidation = GAIN_MIN_VALUE <= constants.gain && GAIN_MAX_VALUE >= constants.gain;
        const penaltyValidation = PENALTY_MIN_VALUE <= constants.penalty && PENALTY_MAX_VALUE >= constants.penalty;
        return initialValidation && gainValidation && penaltyValidation;
    }
}
