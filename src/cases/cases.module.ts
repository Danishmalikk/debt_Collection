import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case, CaseSchema } from './schemas/case.schema';
import { RawCase, RawCaseSchema } from './schemas/raw-case.schema';
import { CaseAudit, CaseAuditSchema } from './schemas/case-audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Case.name, schema: CaseSchema },
      { name: RawCase.name, schema: RawCaseSchema },
      { name: CaseAudit.name, schema: CaseAuditSchema },
    ]),
  ],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
