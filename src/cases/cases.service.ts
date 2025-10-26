import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseDocument } from './schemas/case.schema';
import { RawCase, RawCaseDocument } from './schemas/raw-case.schema';
import { CaseAudit, CaseAuditDocument } from './schemas/case-audit.schema';
import { encryptField, decryptField } from '../common/utils/crypto.util';
import { CaseStatus } from './enums/case-status.enums';
import { assignmentRules } from 'src/config/assignment-rules.config';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case.name) private caseModel: Model<CaseDocument>,
    @InjectModel(RawCase.name) private rawCaseModel: Model<RawCaseDocument>,
    @InjectModel(CaseAudit.name) private caseAuditModel: Model<CaseAuditDocument>,
  ) {}

  async getCasesByAssignee(assigned_to: string) {
    return this.caseModel.find({ assigned_to }).exec();
  }

  private normalizeRecord(record: any) {
    if (!record.case_id) throw new BadRequestException('case_id missing');
    return {
      case_id: String(record.case_id).trim(),
      bank_code: String(record.bank_code || '').trim(),
      borrower_name: String(record.borrower_name || '').trim(),
      loan_amount: Number(record.loan_amount) || 0,
      due_amount: Number(record.due_amount) || 0,
      days_past_due: Number(record.days_past_due) || 0,
      priority: String(record.priority || 'normal').trim(),
      region: String(record.region || '').trim(),
    };
  }

  // Save raw + encrypted processed
  private async saveRecord(record: any, source = 'json') {
    // store raw
    const raw = new this.rawCaseModel({
            case_id: record.case_id,
            payload: record,
            meta: { ingestedAt: new Date() },
          });
    await raw.save();

    const normalized = this.normalizeRecord(record);
    const assignedTo = this.assignAgent(normalized.days_past_due);
    const enc = encryptField(normalized.borrower_name || '');

    const processedDoc = {
      ...normalized,
      assigned_to: assignedTo,
      borrower_name_iv: enc.iv,
      borrower_name_enc: enc.data,
      status: 'new',
      // remove plaintext borrower_name field (we stored encrypted variant)
    };

    // upsert processed case
    const processed = await this.caseModel.findOneAndUpdate(
      { case_id: processedDoc.case_id },
      { $set: processedDoc },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return { raw, processed };
  }

  // Expose a method to decrypt before returning to callers
  private decryptCase(doc: any) {
    if (!doc) return doc;
    const borrower_name = decryptField(doc.borrower_name_iv, doc.borrower_name_enc);
    const out = doc.toObject ? doc.toObject() : { ...doc };
    out.borrower_name = borrower_name;
    // optionally remove encrypted fields from response
    delete out.borrower_name_enc;
    delete out.borrower_name_iv;
    return out;
  }

  // Public: get all cases (with decrypt)
  async getAllCases(status?: string, assignedTo?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assigned_to = assignedTo;
    const docs = await this.caseModel.find(filter).exec();
    return docs.map(d => this.decryptCase(d));
  }

  private assignAgent(daysPastDue: number): string {
    for (const rule of assignmentRules) {
      if (rule.condition(daysPastDue)) {
        return rule.assignedTo;
      }
    }
    return 'unassigned';
  }

  // Update status + audit
  async updateCaseStatus(case_id: string, status: string, changed_by = 'system', reason?: string) {
    const validStatuses = Object.values(CaseStatus) as string[];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Valid: ${validStatuses.join(', ')}`);
    }

    const existing = await this.caseModel.findOne({ case_id }).exec();
    if (!existing) throw new NotFoundException(`Case ${case_id} not found`);

    const prevStatus = existing.status;
    const updated = await this.caseModel.findOneAndUpdate(
      { case_id },
      { status },
      { new: true },
    );

    // write audit entry
    await this.caseAuditModel.create({
      case_id,
      changed_by,
      from_status: prevStatus,
      to_status: status,
      reason,
      meta: { at: new Date() },
    });

    return this.decryptCase(updated);
  }

  // ingest many
  async ingestMany(records: any[], source = 'json') {
    type IngestResult =
      | { status: 'ok'; case_id: string }
      | { status: 'error'; error: string; input: any };

    const results: IngestResult[] = [];
    for (const r of records) {
      try {
        const res = await this.saveRecord(r, source);
        results.push({ status: 'ok', case_id: res.processed.case_id });
      } catch (err) {
        results.push({ status: 'error', error: err.message || String(err), input: r });
      }
    }
    return results;
  }

  // fetch audit history for a case
  async getAuditForCase(case_id: string) {
    return this.caseAuditModel.find({ case_id }).sort({ createdAt: -1 }).exec();
  }
}
