/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-restricted-imports */
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from '../file/file.service';
import { ConstantsService } from './constants.service';

describe('ConstantsService', () => {
    let service: ConstantsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConstantsService, FileService],
        }).compile();

        service = module.get<ConstantsService>(ConstantsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('verifyConstants should return true if constants are valid, false otherwise', () => {
        expect(service['verifyConstants']({ initial: 32, penalty: 5, gain: 5 } as GameConstants)).toEqual(true);
        expect(service['verifyConstants']({ initial: 0, penalty: 5, gain: 5 } as GameConstants)).toEqual(false);
        expect(service['verifyConstants']({ initial: 32, penalty: 0, gain: 5 } as GameConstants)).toEqual(false);
        expect(service['verifyConstants']({ initial: 32, penalty: 5, gain: 0 } as GameConstants)).toEqual(false);
        expect(service['verifyConstants']({ initial: 144, penalty: 5, gain: 5 } as GameConstants)).toEqual(false);
        expect(service['verifyConstants']({ initial: 32, penalty: 141, gain: 5 } as GameConstants)).toEqual(false);
        expect(service['verifyConstants']({ initial: 32, penalty: 6, gain: 414 } as GameConstants)).toEqual(false);
    });

    it('setConstants should call verifyConstants, returns its value and call fileService.write when returns true', () => {
        const writeSpy = jest.spyOn(service['fileService'], 'write').mockImplementation(() => {});
        const validateSpy = jest.spyOn<ConstantsService, any>(service, 'verifyConstants').mockReturnValue(true);
        service.setConstants({} as GameConstants);
        expect(validateSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalled();
    });

    it('setConstants should call verifyConstants, returns its value and not call fileService.write when returns false', () => {
        const writeSpy = jest.spyOn(service['fileService'], 'write').mockImplementation(() => {});
        const validateSpy = jest.spyOn<ConstantsService, any>(service, 'verifyConstants').mockReturnValue(false);
        service.setConstants({} as GameConstants);
        expect(validateSpy).toHaveBeenCalled();
        expect(writeSpy).not.toHaveBeenCalled();
    });
});
