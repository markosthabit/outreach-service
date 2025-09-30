import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Servantee, ServanteeDocument } from './schemas/servantee.schema';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';

@Injectable()
export class ServanteesService {
  constructor(
    @InjectModel(Servantee.name) private servanteeModel: Model<ServanteeDocument>,
  ) {}

  create(createServanteeDto: CreateServanteeDto): Promise<Servantee> {
    const newServantee = new this.servanteeModel(createServanteeDto);
    return newServantee.save();
  }

findOne(id: string): Promise<ServanteeDocument | null> {
  return this.servanteeModel.findById(id).exec();
}

update(id: string, updateServanteeDto: UpdateServanteeDto): Promise<ServanteeDocument | null> {
  return this.servanteeModel.findByIdAndUpdate(id, updateServanteeDto, { new: true }).exec();
}

remove(id: string): Promise<ServanteeDocument | null> {
  return this.servanteeModel.findByIdAndDelete(id).exec();
}

findAll(): Promise<ServanteeDocument[]> {
  return this.servanteeModel.find().exec();
}

}
