import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case } from '../cases/schemas/case.schema';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Case.name) private caseModel: Model<Case>) {}

  async getSummary() {
    // 1. Total cases by status
    const totalCasesByStatus = await this.caseModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusSummary = totalCasesByStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // 2. Case count per team
    const caseCountPerTeam = await this.caseModel.aggregate([
      { $group: { _id: '$assigned_to', count: { $sum: 1 } } },
    ]);

    const teamSummary = caseCountPerTeam.reduce((acc, cur) => {
      acc[cur._id || 'Unassigned'] = cur.count;
      return acc;
    }, {});

    // 3. Mock average resolution time
    const averageResolutionTimeDays = parseFloat((Math.random() * 15 + 5).toFixed(1));

    // 4. Mock recovered amount (sum of random portion of resolved cases’ due_amount)
    const resolvedCases = await this.caseModel.find({ status: 'Resolved' });
    const totalRecoveredAmount = resolvedCases.reduce((sum, c) => {
      const recovered = c.due_amount ? c.due_amount * 0.8 : 0; // assume 80% recovery
      return sum + recovered;
    }, 0);

    return {
      totalCasesByStatus: statusSummary,
      averageResolutionTimeDays,
      caseCountPerTeam: teamSummary,
      totalRecoveredAmount,
    };
  }
}
