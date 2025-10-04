import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsArray, IsPhoneNumber } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServanteeDto {
  @ApiProperty({ example: '01012345678', description: 'Unique phone number of the servantee' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the servantee' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2000-01-01', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ example: 'University', required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ example: 'Engineer', required: false })
  @IsOptional()
  @IsString()
  work?: string;

  @ApiProperty({ example: 'St. Mary Church', required: false })
  @IsOptional()
  @IsString()
  church?: string;

  @ApiProperty({ example: ['2023-05-01', '2023-07-10'], required: false })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  retreatDates?: string[];

  @ApiProperty({ example: ['Very active in church'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
