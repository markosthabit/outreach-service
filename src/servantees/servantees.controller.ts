import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ServanteesService } from './servantees.service';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';

@ApiTags('Servantees')
@Controller('servantees')
export class ServanteesController {
  constructor(private readonly servanteesService: ServanteesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new servantee' })
  @ApiResponse({ status: 201, description: 'The servantee has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error.' })
  @ApiResponse({ status: 409, description: 'Conflict - Phone number already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  create(@Body() createServanteeDto: CreateServanteeDto) {
    return this.servanteesService.create(createServanteeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all servantees' })
  findAll() {
    return this.servanteesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a servantee by ID' })
  @ApiResponse({ status: 200, description: 'Returns the servantee.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid ObjectId.' })
  @ApiResponse({ status: 404, description: 'Servantee not found.' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.servanteesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a servantee by ID' })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateServanteeDto: UpdateServanteeDto) {
    return this.servanteesService.update(id, updateServanteeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a servantee by ID' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.servanteesService.remove(id);
  }
}
