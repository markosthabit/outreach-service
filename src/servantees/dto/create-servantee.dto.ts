import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from '@nestjs/class-validator';
export class CreateServanteeDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  work?: string;

  @IsOptional()
  @IsString()
  church?: string;

  @IsOptional()
  retreatDates?: string[];

  @IsOptional()
  notes?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
