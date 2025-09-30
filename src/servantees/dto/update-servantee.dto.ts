import { PartialType } from '@nestjs/mapped-types';
import { CreateServanteeDto } from './create-servantee.dto';

export class UpdateServanteeDto extends PartialType(CreateServanteeDto) {}
