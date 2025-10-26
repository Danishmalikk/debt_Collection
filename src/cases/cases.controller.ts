import {
   Controller,
   Post,
   Body,
   UploadedFile,
   UseInterceptors,
   BadRequestException,
   HttpCode,
   HttpStatus,
   Get} from '@nestjs/common';
import { CasesService } from './cases.service';


interface CreateUserDto {
  name: string;
  age: number;
}

@Controller('cases')
export class CasesController {
  private users: CreateUserDto[] = [];
  constructor(private readonly casesService: CasesService) {}

  @Post('upload')
  async upload(@Body() body: any) {
    // Expecting body = { data: [...] } or directly an array
    const records = Array.isArray(body)
      ? body
      : Array.isArray(body.data)
      ? body.data
      : [];

    if (!records.length) {
      throw new Error('No valid records provided. Expected JSON array of cases.');
    }

    const results = await this.casesService.ingestMany(records, 'json');

    return {
      message: `Processed ${results.length} case(s) successfully.`,
      results,
    };
  }


  @Post('/test')
  createUser(@Body() createUserDto: CreateUserDto): string {
    this.users.push(createUserDto);
    return `User ${createUserDto.name} created!`;
  }

  @Get('/getUsers')
  findUser() : CreateUserDto [] { 
    return this.users;
  }
}
