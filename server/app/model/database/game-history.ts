import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameHistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @Prop({ required: true })
    dateStarted: string;

    @Prop({ required: true })
    timeStarted: string;

    @Prop({ required: true })
    timeLength: string;

    @Prop({ required: true })
    gameType: string;

    @Prop({ required: true })
    firstPlayer: string;

    @Prop({ required: true })
    secondPlayer: string;

    @Prop({ required: true })
    winnerSocketId: string;

    @Prop({ required: true })
    surrender: boolean;

    @Prop({ required: true })
    surrenderSocketId: string;

    @Prop({ required: true })
    firstPlayerSocketId: string;

    @Prop({ required: true })
    secondPlayerSocketId: string;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
