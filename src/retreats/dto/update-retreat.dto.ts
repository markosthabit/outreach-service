import { PartialType } from '@nestjs/mapped-types';
import { CreateRetreatDto } from './create-retreat.dto';

export class UpdateRetreatDto extends PartialType(CreateRetreatDto) {}
