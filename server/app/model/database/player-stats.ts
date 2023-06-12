import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StatDocument = PlayerStats & Document;

@Schema()
export class PlayerStats {
    @Prop({ required: true })
    cardId: string;

    @Prop({ required: true })
    firstMode: string;

    @Prop({ required: true })
    secondMode: string;

    @Prop({ required: true })
    playerName: string;

    @Prop({ required: true })
    score: number;
}

export const statSchema = SchemaFactory.createForClass(PlayerStats);
