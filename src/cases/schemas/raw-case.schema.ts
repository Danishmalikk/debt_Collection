
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RawCaseDocument = RawCase & Document;

@Schema({ timestamps: true, collection: 'raw_cases' })
export class RawCase {
  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  payload: string;

  @Prop({ default: {} })
  meta: string;
}

export const RawCaseSchema = SchemaFactory.createForClass(RawCase);
