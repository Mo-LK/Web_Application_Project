import { CardController } from '@app/controllers/card/card.controller';
import { ImageController } from '@app/controllers/image/image.controller';
import { GameManagerGateway } from '@app/gateways/game-manager/game-manager.gateway';
import { PlayerStats, statSchema } from '@app/model/database/player-stats';
import { CardService } from '@app/services/card/card.service';
import { DatabaseService } from '@app/services/database/database.service';
import { DifferencesDetectionService } from '@app/services/differences-detection/differences-detection.service';
import { HistoryService } from '@app/services/history/history.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsManagerGateway } from './gateways/cards-manager/cards-manager.gateway';
import { GameHistory, gameHistorySchema } from './model/database/game-history';
import { ConstantsService } from './services/constants/constants.service';
import { FileService } from './services/file/file.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { StatsService } from './services/stats/stats.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: PlayerStats.name, schema: statSchema },
            { name: GameHistory.name, schema: gameHistorySchema },
        ]),
    ],
    controllers: [CardController, ImageController],
    providers: [
        CardService,
        DifferencesDetectionService,
        DatabaseService,
        GameManagerGateway,
        CardsManagerGateway,
        StatsService,
        FileService,
        HistoryService,
        ConstantsService,
        GameManagerService,
    ],
})
export class AppModule {}
