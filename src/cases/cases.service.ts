import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseDocument } from './schemas/case.schema';
import { RawCase, RawCaseDocument } from './schemas/raw-case.schema';
import { assignmentRules } from 'src/config/assignment-rules.config';
import { CaseStatus } from './enums/case-status.enums';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case.name)
    private readonly caseModel: Model<CaseDocument>,
    @InjectModel(RawCase.name)
    private readonly rawCaseModel: Model<RawCaseDocument>,
  ) {}

  async getAllCases(status?: string, assignedTo?: string) { 
    const filter: any = {}; 

    if(status) filter.status = status;
    if(assignedTo) filter.assigned_to = assignedTo;

    return this.caseModel.find(filter).exec();
  }

  async getCasesByAssignee(assigned_to: string) {
    return this.caseModel.find({ assigned_to }).exec();
  }

  async updateCaseStatus(case_id: string, status: string) {
    const validStatuses = Object.values(CaseStatus);
    if (!validStatuses.includes(status as CaseStatus)) {
      throw new BadRequestException(`Invalid status. Valid: ${validStatuses.join(', ')}`);
    }

    const updatedCase = await this.caseModel.findOneAndUpdate(
      { case_id },
      { status },
      { new: true },
    );

    if (!updatedCase) {
      throw new NotFoundException(`Case with ID ${case_id} not found`);
    }

    return updatedCase;
  }

  // Normalize and validate each record
  private normalizeRecord(record: any) {
    if (!record.case_id || !record.borrower_name) {
      throw new Error('Missing required fields: case_id or borrower_name.');
    }

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

  private assignAgent(daysPastDue: number): string {
    for (const rule of assignmentRules) {
      if (rule.condition(daysPastDue)) {
        return rule.assignedTo;
      }
    }
    return 'unassigned';
  }

  // Save both raw and processed versions
  private async saveRecord(record: any, source = 'json') {
    // const raw = new this.rawCaseModel({ ...record, source });
    // await raw.save();

    const processedData = this.normalizeRecord(record);
    const assignedTo = this.assignAgent(processedData.days_past_due);
    const processed = new this.caseModel({
      ...processedData,
      assigned_to: assignedTo,
      status: 'new',
    });
    await processed.save();

    return { processed };
  }

  // Step 3: Handle multiple records
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
        results.push({
          status: 'error',
          error: err.message || String(err),
          input: r,
        });
      }
    }
    return results;
  }
}
