import { PartialType } from '@nestjs/mapped-types';
import { CreateServanteeDto } from './create-servantee.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServanteeDto extends PartialType(CreateServanteeDto) {
  @ApiPropertyOptional({ description: 'Name of the servantee (optional update)' })
  name?: string;
}
