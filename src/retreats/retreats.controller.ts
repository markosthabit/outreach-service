import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { RetreatsService } from './retreats.service';
import { CreateRetreatDto } from './dto/create-retreat.dto';
import { UpdateRetreatDto } from './dto/update-retreat.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { Retreat } from './schemas/retreat.schema';

@ApiTags('Retreats')
@Controller('retreats')
@UseFilters(AllExceptionsFilter)
export class RetreatsController {
  constructor(private readonly retreatsService: RetreatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Retreat' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Retreat has been successfully created.',
    type: Retreat
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.'
  })
  async create(@Body() dto: CreateRetreatDto): Promise<Retreat> {
    return this.retreatsService.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all Retreats',
    description: 'Retrieves a list of all retreats with populated attendees and notes.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of retreats retrieved successfully.',
    type: [Retreat]
  })
  async findAll(): Promise<Retreat[]> {
    return this.retreatsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get Retreat by ID',
    description: 'Retrieves a specific retreat by its ID with populated attendees and notes.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the retreat to retrieve',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retreat found and returned successfully.',
    type: Retreat
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retreat not found.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid retreat ID format.'
  })
  async findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<Retreat> {
    return this.retreatsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update Retreat details',
    description: 'Updates a specific retreat\'s information.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the retreat to update',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retreat has been successfully updated.',
    type: Retreat
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retreat not found.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or retreat ID format.'
  })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateRetreatDto
  ): Promise<Retreat> {
    return this.retreatsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a Retreat',
    description: 'Removes a retreat and updates related Servantee records.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the retreat to delete',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Retreat has been successfully deleted.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retreat not found.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid retreat ID format.'
  })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.retreatsService.remove(id);
  }
}
