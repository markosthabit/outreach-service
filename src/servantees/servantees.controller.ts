import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ServanteesService } from './servantees.service';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';

@Controller('servantees')
export class ServanteesController {
  constructor(private readonly servanteesService: ServanteesService) {}

  @Post()
  create(@Body() createServanteeDto: CreateServanteeDto) {
    return this.servanteesService.create(createServanteeDto);
  }

  @Get()
  findAll() {
    return this.servanteesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servanteesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateServanteeDto: UpdateServanteeDto) {
    return this.servanteesService.update(id, updateServanteeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servanteesService.remove(id);
  }
}
