import { Injectable } from '@nestjs/common';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';

@Injectable()
export class ServanteesService {
  create(createServanteeDto: CreateServanteeDto) {
    return 'This action adds a new servantee';
  }

  findAll() {
    return `This action returns all servantees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} servantee`;
  }

  update(id: number, updateServanteeDto: UpdateServanteeDto) {
    return `This action updates a #${id} servantee`;
  }

  remove(id: number) {
    return `This action removes a #${id} servantee`;
  }
}
