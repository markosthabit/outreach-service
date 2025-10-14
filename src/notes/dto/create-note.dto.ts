import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The content of the note',
    example: 'Discussed future involvement in the community.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The ID of the servantee this note is associated with',
    example: '60d0fe4f5311236168a109ca',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  servanteeId?: Types.ObjectId;

  @ApiProperty({
    description: 'The ID of the retreat this note is associated with',
    example: '60d0fe4f5311236168a109cb',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  retreatId?: Types.ObjectId;
}
