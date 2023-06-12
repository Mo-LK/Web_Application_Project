/* eslint-disable */
import { HttpStatus } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as fs from "fs";
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImageController],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getImage should return image when no error', async () => {
        const res = {} as unknown as Response;
        res.set = () => res;
        const filename = "tests/image_empty";
        const file = controller.getImage(filename, res);
        expect(file).toBeInstanceOf(StreamableFile);
    });

    it('isDifference should return NOT_FOUND when error in service', async () => {
        const res = {} as unknown as Response;
        const imgId = '11';
        jest.mock("fs");
        jest.spyOn(fs, "createReadStream").mockImplementation();
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        controller.getImage(imgId, res);
    });
});
