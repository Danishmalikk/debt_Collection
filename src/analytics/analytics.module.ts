import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Case, CaseSchema } from '../cases/schemas/case.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Case.name, schema: CaseSchema }])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
