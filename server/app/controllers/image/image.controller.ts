import { IMG_LOCATION } from '@app/services/differences-detection/differences-detection.service.constants';
import { Controller, Get, HttpStatus, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('image')
export class ImageController {
    @Get('/:id')
    getImage(@Param('id') imgId: string, @Res({ passthrough: true }) res: Response): StreamableFile {
        try {
            const file = createReadStream(join(join(process.cwd(), IMG_LOCATION), imgId + '.bmp'));
            res.set({
                // Disable lint because we need to set header to make reponse work
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'image/bmp',
                // Disable lint because we need to set header to make reponse work
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Disposition': 'attachment; filename="' + imgId + '.bmp"',
            });
            return new StreamableFile(file);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).send('Image not found with this id');
        }
    }
}
