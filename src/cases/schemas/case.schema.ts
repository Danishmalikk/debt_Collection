
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CaseStatus } from '../enums/case-status.enums';

@Schema({ timestamps: true, collection: 'cases' })
export class Case {
  @Prop({ required: true, index: true, unique: true })
  case_id: string;

  @Prop()
  borrower_name_iv?: string;

  @Prop()
  borrower_name_enc?: string;

  @Prop({ required: true })
  bank_code: string;

  @Prop({ required: true })
  loan_amount: number;

  @Prop({ required: true })
  due_amount: number;

  @Prop({ required: true })
  days_past_due: number;

  @Prop({ required: true })
  priority: string;

  @Prop()
  region?: string;

  @Prop({ default: 'unassigned' })
  assigned_to: string;

  @Prop({
    type: String,
    enum: Object.values(CaseStatus),
    default: CaseStatus.Pending,
  })
  status: string;
}

export type CaseDocument = Case & Document;
export const CaseSchema = SchemaFactory.createForClass(Case);
