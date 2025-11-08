import { Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Servantee } from '../servantees/schemas/servantee.schema';
import { Retreat } from '../retreats/schemas/retreat.schema';
import {
  NoteNotFoundException,
  InvalidNoteIdException,
  InvalidEntityIdException,
  EntityNotFoundException,
  NoteOperationFailedException,
  MissingEntityIdException,
} from './exceptions/notes.exceptions';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectModel('Note') private readonly noteModel: Model<Note>,
    @InjectModel('Servantee') private readonly servanteeModel: Model<Servantee>,
    @InjectModel('Retreat') private readonly retreatModel: Model<Retreat>,
  ) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    try {
      const { servanteeId, retreatId } = createNoteDto;

      if (!servanteeId && !retreatId) {
        throw new MissingEntityIdException();
      }

      if (servanteeId) {
        if (!Types.ObjectId.isValid(servanteeId)) {
          throw new InvalidEntityIdException('servantee');
        }
        const servanteeExists = await this.servanteeModel.findById(servanteeId);
        if (!servanteeExists) {
          throw new EntityNotFoundException('Servantee', servanteeId.toString());
        }
      }

      if (retreatId) {
        if (!Types.ObjectId.isValid(retreatId)) {
          throw new InvalidEntityIdException('retreat');
        }
        const retreatExists = await this.retreatModel.findById(retreatId);
        if (!retreatExists) {
          throw new EntityNotFoundException('Retreat', retreatId.toString());
        }
      }

      const newNote = new this.noteModel(createNoteDto);
      return await newNote.save();
    } catch (error) {
      this.logger.error(`Failed to create note: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new NoteOperationFailedException('create', error.message);
    }
  }

  async findAllForServantee(servanteeId: string): Promise<Note[]> {
    try {
      if (!Types.ObjectId.isValid(servanteeId)) {
        throw new InvalidEntityIdException('servantee');
      }
      return await this.noteModel.find({ servanteeId: servanteeId }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find notes for servantee ${servanteeId}: ${error.message}`,
        error.stack,
      );
      throw new NoteOperationFailedException('find', error.message);
    }
  }

  async findAllForRetreat(retreatId: string): Promise<Note[]> {
    try {
      if (!Types.ObjectId.isValid(retreatId)) {
        throw new InvalidEntityIdException('retreat');
      }
      return await this.noteModel.find({ retreatId: retreatId }).exec();
    } catch (error) {
      this.logger.error(
        `Failed to find notes for retreat ${retreatId}: ${error.message}`,
        error.stack,
      );
      throw new NoteOperationFailedException('find', error.message);
    }
  }

  async findOne(noteId: string): Promise<Note> {
    try {
      if (!Types.ObjectId.isValid(noteId)) {
        throw new InvalidNoteIdException();
      }
      const note = await this.noteModel.findById(noteId);
      if (!note) {
        throw new NoteNotFoundException(noteId);
      }
      return note;
    } catch (error) {
      this.logger.error(`Failed to find note ${noteId}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new NoteOperationFailedException('find', error.message);
    }
  }

  async update(noteId: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    try {
      await this.findOne(noteId); // a validation to check if note exists
      const updatedNote = await this.noteModel.findByIdAndUpdate(noteId, updateNoteDto, {
        new: true,
      });
      if (!updatedNote) {
        throw new NoteNotFoundException(noteId);
      }
      return updatedNote;
    } catch (error) {
      this.logger.error(`Failed to update note ${noteId}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new NoteOperationFailedException('update', error.message);
    }
  }

  async delete(noteId: string): Promise<DeleteResult> {
    try {
      const result = await this.noteModel.deleteOne({ _id: noteId });
      
      if (result.deletedCount === 0) {
        throw new NoteNotFoundException(noteId);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete note ${noteId}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new NoteOperationFailedException('delete', error.message);
    }
  }
}
