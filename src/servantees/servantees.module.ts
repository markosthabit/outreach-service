import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Servantee, ServanteeSchema } from './schemas/servantee.schema';
import { ServanteesService } from './servantees.service';
import { ServanteesController } from './servantees.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Servantee.name, schema: ServanteeSchema }])
  ],
  controllers: [ServanteesController],
  providers: [ServanteesService],
})
export class ServanteesModule {}
