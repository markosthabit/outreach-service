import { IsString, IsDateString, IsArray, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRetreatDto {
  @ApiProperty({
    example: 'Summer Retreat 2025',
    description: 'Name of the retreat'
  })
  @IsString()
  name: string;
  @ApiProperty({
    example: 'Al Shuranya',
    description: 'Locatin of the retreat'
  })
  @IsString()
  location: string;

  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
    description: 'Start date of the retreat'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-06-07T00:00:00.000Z',
    description: 'End date of the retreat'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of Servantee IDs attending the retreat',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  attendees?: Types.ObjectId[];

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of Note IDs associated with the retreat',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  notes?: Types.ObjectId[];
}
