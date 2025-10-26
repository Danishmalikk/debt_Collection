import { Transform } from "class-transformer";
import { IsNumber, IsString, IsOptional, IsInt, Min, Max, IsIn } from "class-validator";

export class CreateCaseDto {
  @IsString()
  case_id: string;

  @IsString()
  bank_code: string;

  @IsString()
  borrower_name: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  loan_amount: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  due_amount: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  days_past_due: number;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  region?: string;
}