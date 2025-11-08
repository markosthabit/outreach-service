import { Module } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Servantee, ServanteeSchema } from './schemas/servantee.schema';
import { ServanteesService } from './servantees.service';
import { ServanteesController } from './servantees.controller';
import { Model } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Servantee', schema: ServanteeSchema }])
  ],
  controllers: [ServanteesController],
  providers: [ServanteesService],
})
export class ServanteesModule {
  constructor(@InjectModel('Servantee') private model: Model<Servantee>) { }
}
