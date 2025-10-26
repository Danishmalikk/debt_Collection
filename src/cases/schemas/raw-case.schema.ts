import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'raw_cases' })
export class RawCase {
  @Prop({ required: true })
  case_id: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export type RawCaseDocument = RawCase & Document;
export const RawCaseSchema = SchemaFactory.createForClass(RawCase);
