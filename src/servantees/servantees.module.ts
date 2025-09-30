import { Module } from '@nestjs/common';
import { ServanteesService } from './servantees.service';
import { ServanteesController } from './servantees.controller';

@Module({
  controllers: [ServanteesController],
  providers: [ServanteesService],
})
export class ServanteesModule {}
