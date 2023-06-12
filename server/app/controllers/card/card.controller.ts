import { CardService } from '@app/services/card/card.service';
import { CardIO } from '@common/card-io';
import { GameConstants } from '@common/game-constants';
import { Message } from '@common/message';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Cards')
@Controller('card')
export class CardController {
    constructor(private cardService: CardService) {}

    @ApiOkResponse({
        description: 'Get card constants information',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/constants')
    async getConstants(@Res() response: Response) {
        try {
            const constants = await this.cardService.getGameConstants();
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(constants)));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Add a card',
        type: String,
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when request is badly formulated',
    })
    @ApiBadRequestResponse({
        description: "Return BAD_REQUEST when the given card differences haven't been computed yet",
    })
    @Post('/')
    async saveCard(@Body() body: Message, @Res() response: Response) {
        try {
            const cardIO = JSON.parse(body.body) as CardIO;
            if (!cardIO.firstImage || !cardIO.secondImage) {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Request badly formulated. Information missing'));
            } else {
                const originalImage = Buffer.from(cardIO.firstImage, 'base64');
                const modifiedImage = Buffer.from(cardIO.secondImage, 'base64');
                const id = await this.cardService.saveCard(cardIO.metadata, { originalImage, modifiedImage });
                if (!id) {
                    response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', "The card's differences haven't been computed yet"));
                } else {
                    response.status(HttpStatus.OK).send(this.toMessage('OK', id));
                }
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'An array containing the history of all games',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/history')
    async getAllHistory(@Res() response: Response) {
        try {
            const history = await this.cardService.getAllHistory();
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(history)));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Reset the collection of game history',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Delete('/history')
    async resetHistory(@Res() response: Response) {
        try {
            await this.cardService.resetHistory();
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Get a card information',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when card is not found',
    })
    @Get('/:id')
    async getCard(@Param('id') cardId: string, @Res() response: Response) {
        try {
            const card = await this.cardService.getCard(cardId);
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(card)));
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(this.toMessage('NOT FOUND', 'No card was found with this id'));
        }
    }

    @ApiOkResponse({
        description: 'Set card constants information',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when request is badly formulated',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Post('/constants')
    async setConstants(@Body() body: Message, @Res() response: Response) {
        try {
            const constants = JSON.parse(body.body) as GameConstants;
            const isSuccess = this.cardService.setConstants(constants);
            if (isSuccess) response.status(HttpStatus.OK).send();
            else response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Request badly formulated. Information missing'));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiOkResponse({
        description: 'An array containing all cards',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Get('/')
    async getAllCards(@Res() response: Response) {
        try {
            const cards = await this.cardService.getAllCards();
            response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(cards)));
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiNoContentResponse({
        description: 'Reset all stats on all cards',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/stats')
    async resetStats(@Res() response: Response) {
        try {
            await this.cardService.resetAllStats();
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    @ApiNoContentResponse({
        description: 'Delete a card',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteCard(@Param('id') cardId: string, @Res() response: Response) {
        const result = await this.cardService.deleteCard(cardId);
        if (result) {
            response.status(HttpStatus.NO_CONTENT).send();
        } else {
            response.status(HttpStatus.NOT_FOUND).send(this.toMessage('NOT FOUND', "Couldn't delete Card with id " + cardId));
        }
    }

    @ApiNoContentResponse({
        description: 'Delete all cards',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async deleteAllCards(@Res() response: Response) {
        const result = await this.cardService.deleteAllCards();
        if (result) {
            response.status(HttpStatus.NO_CONTENT).send();
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', "Couldn't delete all cards"));
        }
    }

    @ApiNoContentResponse({
        description: 'Reset all stats on a single card',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @Delete('/stats/:id')
    async resetStat(@Param('id') cardId: string, @Res() response: Response) {
        try {
            await this.cardService.resetStat(cardId);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(this.toMessage('NOT FOUND', error.message));
        }
    }

    @ApiOkResponse({
        description: 'Compute card differences and generate differences image',
    })
    @ApiInternalServerErrorResponse({
        description: 'Return INTERNAL_SERVER_ERROR http status when request fails',
    })
    @ApiBadRequestResponse({
        description: 'Return BAD_REQUEST when request is badly formulated',
    })
    @Post('/differences-image')
    async getDifferencesImage(@Body() body: Message, @Res() response: Response) {
        try {
            const cardIO = JSON.parse(body.body) as CardIO;
            if (!cardIO.firstImage || !cardIO.secondImage) {
                response.status(HttpStatus.BAD_REQUEST).send(this.toMessage('BAD REQUEST', 'Request badly formulated. Information missing'));
            } else {
                const originalImage = Buffer.from(cardIO.firstImage, 'base64');
                const modifiedImage = Buffer.from(cardIO.secondImage, 'base64');
                const images = { originalImage, modifiedImage };

                const card = await this.cardService.computeCardDifferences(cardIO.metadata, images);

                const differencesImage = await this.cardService.getDifferencesImage(card);
                const returnedCardIO: CardIO = {} as CardIO;
                returnedCardIO.firstImage = differencesImage.toString('base64');
                returnedCardIO.metadata = card;
                response.status(HttpStatus.OK).send(this.toMessage('OK', JSON.stringify(returnedCardIO)));
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.toMessage('INTERNAL SERVER ERROR', error.message));
        }
    }

    private toMessage(title: string, data: string): Message {
        return {
            title,
            body: data,
        };
    }
}
