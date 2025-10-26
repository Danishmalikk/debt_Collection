import {
   Controller,
   Post,
   Body,
   Get,
   Query,
   Patch,
   Param,
   UseGuards,
   Req} from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';


interface CreateUserDto {
  name: string;
  age: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases')
export class CasesController {
  private users: CreateUserDto[] = [];
  constructor(private readonly casesService: CasesService) {}

  @Post('/test')
  createUser(@Body() createUserDto: CreateUserDto): string {
    this.users.push(createUserDto);
    return `User ${createUserDto.name} created!`;
  }

  @Get('/getUsers')
  findUser() : CreateUserDto [] { 
    return this.users;
  }

  @Get()
  @Roles('Admin', 'TeamLead', 'Agent')
  async getAllCases(
    @Query('status') status?: string, 
    @Query('assigned_to') assignedTo?: string,
  ) {
    return this.casesService.getAllCases(status, assignedTo); 
  }

  @Get()
  async getCases(@Query('assigned_to') assignedTo: string) {
    if (!assignedTo) {
      throw new Error("Missing required query param: assigned_to");
    }
    const cases = await this.casesService.getCasesByAssignee(assignedTo);
    return { count: cases.length, data: cases };
  }

  @Patch(':case_id/update-status')
  @Roles('Admin','TeamLead')
  async updateStatus(@Param('case_id') caseId: string, @Body('status') status: string, @Body('reason') reason?: string, @Req() req?) {
    const user = req.user || { username: 'system' };
    return this.casesService.updateCaseStatus(caseId, status, user.userId || user.name, reason);
  }

  @Post('upload')
  async upload(@Body() body: any) {
    // Expecting body = { data: [...] } or directly an array
    const records = Array.isArray(body) ? body : Array.isArray(body.data) ? body.data : [];

    if (!records.length) {
      throw new Error('No valid records provided. Expected JSON array of cases.');
    }
    const results = await this.casesService.ingestMany(records, 'json');
    return {
      message: `Processed ${results.length} case(s) successfully.`,
      results,
    };
  }

  @Get(':case_id/audit')
  @Roles('Admin','TeamLead')
  async getAudit(@Param('case_id') caseId: string) {
    return this.casesService.getAuditForCase(caseId);
  }
}
