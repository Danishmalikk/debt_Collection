import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'case_audits' })
export class CaseAudit {
  @Prop({ required: true })
  case_id: string;

  @Prop({ required: true })
  changed_by: string; // user id or system

  @Prop()
  from_status?: string;

  @Prop()
  to_status?: string;

  @Prop()
  reason?: string;

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export type CaseAuditDocument = CaseAudit & Document;
export const CaseAuditSchema = SchemaFactory.createForClass(CaseAudit);
