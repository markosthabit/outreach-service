import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServanteesService } from './servantees.service';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // userId
    email: string;
    role: UserRole;
  };
}

@ApiTags('Servantees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SERVANT)
@Controller('servantees')
export class ServanteesController {
  constructor(private readonly servanteesService: ServanteesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new servantee' })
  @ApiResponse({
    status: 201,
    description: 'The servantee has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 409, description: 'Phone number already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(
    @Body() createServanteeDto: CreateServanteeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.servanteesService.create(createServanteeDto, req.user.sub);
  }

  @Get()
 @ApiOperation({ summary: 'Get all servantees with pagination and search' })
@ApiResponse({
  status: 200,
  description: 'List of servantees with pagination metadata.',
})
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('search') search = '',
) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10)); // prevent abuse


  return this.servanteesService.findAll({
    page: pageNum,
    limit: limitNum,
    search,
  });
}

  @Get(':id')
  @ApiOperation({ summary: 'Get a servantee by ID' })
  @ApiResponse({ status: 200, description: 'Returns the servantee.' })
  @ApiResponse({ status: 404, description: 'Servantee not found.' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.servanteesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a servantee by ID' })
  @ApiResponse({ status: 200, description: 'Servantee updated successfully.' })
  @ApiResponse({ status: 404, description: 'Servantee not found.' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateServanteeDto: UpdateServanteeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.servanteesService.update(id, updateServanteeDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a servantee by ID (Admin only)' })
  @Roles(UserRole.ADMIN) // Only Admin can delete
  @ApiResponse({ status: 200, description: 'Servantee deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Servantee not found.' })
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.servanteesService.remove(id, req.user.sub);
  }
}
