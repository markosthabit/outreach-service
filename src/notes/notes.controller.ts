import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseFilters,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './schemas/note.schema';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DeleteResult } from 'mongoose';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseFilters(AllExceptionsFilter)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The note has been successfully created.',
    type: Note,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(createNoteDto);
  }

  @Get('servantee/:servanteeId')
  @ApiOperation({ summary: 'Get all notes for a specific servantee' })
  @ApiParam({
    name: 'servanteeId',
    description: 'ID of the servantee',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of notes for the servantee.',
    type: [Note],
  })
  async findAllForServantee(
    @Param('servanteeId', ParseObjectIdPipe) servanteeId: string,
  ): Promise<Note[]> {
    return this.notesService.findAllForServantee(servanteeId);
  }

  @Get('retreat/:retreatId')
  @ApiOperation({ summary: 'Get all notes for a specific retreat' })
  @ApiParam({
    name: 'retreatId',
    description: 'ID of the retreat',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of notes for the retreat.',
    type: [Note],
  })
  async findAllForRetreat(
    @Param('retreatId', ParseObjectIdPipe) retreatId: string,
  ): Promise<Note[]> {
    return this.notesService.findAllForRetreat(retreatId);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get a specific note by its ID' })
  @ApiParam({ name: 'noteId', description: 'ID of the note', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The note with the given ID.',
    type: Note,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found.',
  })
  async findOne(
    @Param('noteId', ParseObjectIdPipe) noteId: string,
  ): Promise<Note> {
    return this.notesService.findOne(noteId);
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'noteId', description: 'ID of the note to update' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The note has been successfully updated.',
    type: Note,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found.',
  })
  async update(
    @Param('noteId', ParseObjectIdPipe) noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(noteId, updateNoteDto);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'noteId', description: 'ID of the note to delete' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The note has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Note not found.',
  })
  async delete(@Param('noteId', ParseObjectIdPipe) noteId: string): Promise<DeleteResult> {
    return this.notesService.delete(noteId);
  }
}
