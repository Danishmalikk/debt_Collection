import {
   Controller,
   Post,
   Body,
   UploadedFile,
   UseInterceptors,
   BadRequestException,
   HttpCode,
   HttpStatus,
   Get,
   Query,
   Patch,
   Param} from '@nestjs/common';
import { CasesService } from './cases.service';


interface CreateUserDto {
  name: string;
  age: number;
}

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
  async updateStatus(@Param('case_id') caseId: string, @Body('status') status: string) {
    const update = await this.casesService.updateCaseStatus(caseId, status);
    return { message: "Status updated successfully",data: update};
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
}
