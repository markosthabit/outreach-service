import {
  Injectable,
  Logger,
  HttpException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { Retreat } from './schemas/retreat.schema';
import { Servantee } from 'src/servantees/schemas/servantee.schema';
import { CreateRetreatDto } from './dto/create-retreat.dto';
import { UpdateRetreatDto } from './dto/update-retreat.dto';
import {
  RetreatNotFoundException,
  InvalidRetreatIdException,
  RetreatDatesInvalidException,
  RetreatAttendeeNotFoundException,
  RetreatOperationFailedException,
} from './exceptions/retreats.exceptions';

@Injectable()
export class RetreatsService {
  private readonly logger = new Logger(RetreatsService.name);

  constructor(
    @InjectModel('Retreat') private retreatModel: Model<Retreat>,
    @InjectModel('Servantee') private servanteeModel: Model<Servantee>,
  ) {}

  async create(createDto: CreateRetreatDto): Promise<Retreat> {
    try {
      // Validate dates
      const startDate = new Date(createDto.startDate);
      const endDate = new Date(createDto.endDate);

      if (endDate < startDate) {
        throw new RetreatDatesInvalidException('End date cannot be before start date');
      }

      // Validate attendees exist if provided
      if (createDto.attendees?.length) {
        const attendees = await this.servanteeModel.find({
          _id: { $in: createDto.attendees },
        });

        if (attendees.length !== createDto.attendees.length) {
          const found = new Set(attendees.map(a => a._id.toString()));
          const notFound = createDto.attendees.find(id => !found.has(id.toString()));
          throw new RetreatAttendeeNotFoundException(notFound!.toString());
        }
      }

      const retreat = new this.retreatModel(createDto);
      const saved = await retreat.save();

      // Update each Servantee’s retreats list
      if (createDto.attendees?.length) {
        await this.servanteeModel.updateMany(
          { _id: { $in: createDto.attendees } },
          { $addToSet: { retreats: saved._id } },
        );
      }

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create retreat: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new RetreatOperationFailedException('create', error.message);
    }
  }

async findAll(page = 1, limit = 10, search?: string | undefined): Promise<{ data: Retreat[]; total: number; page: number; limit: number }> {
  try {
    const skip = (page - 1) * limit
 const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    
    const [data, total] = await Promise.all([
      this.retreatModel
        .find(filter)
        .populate('attendees', 'name phone')
        .populate('notes', 'content')
        .skip(skip)
        .limit(limit)
        .sort({ startDate: -1 }),
      this.retreatModel.countDocuments(),
    ])

    return { data, total, page, limit }
  } catch (error) {
    this.logger.error(`Failed to fetch retreats: ${error.message}`, error.stack)
    throw new RetreatOperationFailedException('fetch', error.message)
  }
}

  async findOne(id: string): Promise<Retreat> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new InvalidRetreatIdException(id);
      }

      const retreat = await this.retreatModel
        .findById(id)
        .populate('attendees', 'name phone')
        .populate('notes', 'content');

      if (!retreat) {
        throw new RetreatNotFoundException(id);
      }

      return retreat;
    } catch (error) {
      this.logger.error(`Failed to fetch retreat ${id}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new RetreatOperationFailedException('fetch', error.message);
    }
  }
  async findByServantee(servanteeId: string): Promise<Retreat[]> {
  try {
    if (!Types.ObjectId.isValid(servanteeId)) {
      throw new BadRequestException('Invalid servantee ID');
    }

    return await this.retreatModel
      .find({ attendees: servanteeId })
      .sort({ startDate: -1 }) // newest first
      .limit(5) // optional
      .populate('attendees', 'name')
      .exec();
  } catch (error) {
    this.logger.error(`Failed to find retreats for servantee ${servanteeId}: ${error.message}`, error.stack);
    throw new RetreatOperationFailedException('find', error.message);
  }
}


  async update(id: string, updateDto: UpdateRetreatDto): Promise<Retreat> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new InvalidRetreatIdException(id);
      }

      // Validate dates if both are provided
      if (updateDto.startDate && updateDto.endDate) {
        const startDate = new Date(updateDto.startDate);
        const endDate = new Date(updateDto.endDate);
        if (endDate < startDate) {
          throw new RetreatDatesInvalidException('End date cannot be before start date');
        }
      }

      // Validate attendees exist if provided
      if (updateDto.attendees?.length) {
        const attendees = await this.servanteeModel.find({
          _id: { $in: updateDto.attendees },
        });

        if (attendees.length !== updateDto.attendees.length) {
          const found = new Set(attendees.map(a => a._id.toString()));
          const notFound = updateDto.attendees.find(id => !found.has(id.toString()));
          throw new RetreatAttendeeNotFoundException(notFound!.toString());
        }
      }

      const updated = await this.retreatModel
        .findByIdAndUpdate(id, updateDto, {
          new: true,
        })
        .populate('attendees', 'name phone')
        .populate('notes', 'content');

      if (!updated) {
        throw new RetreatNotFoundException(id);
      }

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update retreat ${id}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new RetreatOperationFailedException('update', error.message);
    }
  }

  async remove(id: string): Promise<DeleteResult> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new InvalidRetreatIdException(id);
      }

      const retreat = await this.retreatModel.findById(id);
      if (!retreat) {
        throw new RetreatNotFoundException(id);
      }

      const deleted = await retreat.deleteOne();

      // Remove from Servantees
      await this.servanteeModel.updateMany(
        { retreats: id },
        { $pull: { retreats: id } },
      );
return deleted;    
    } catch (error) {
      this.logger.error(`Failed to delete retreat ${id}: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new RetreatOperationFailedException('delete', error.message);
    }
    
  }
}
