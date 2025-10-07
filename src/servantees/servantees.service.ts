import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, Logger, HttpException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Servantee, ServanteeDocument } from './schemas/servantee.schema';
import { CreateServanteeDto } from './dto/create-servantee.dto';
import { UpdateServanteeDto } from './dto/update-servantee.dto';
import { DuplicatePhoneError, ServanteeNotFoundError, ServanteeError } from './types/servantee-errors';

@Injectable()
export class ServanteesService {
  private readonly logger = new Logger(ServanteesService.name);

  constructor(
    @InjectModel(Servantee.name) private servanteeModel: Model<ServanteeDocument>,
  ) {}

  async create(createServanteeDto: CreateServanteeDto): Promise<Servantee> {
    try {
      if (!createServanteeDto.phone) {
        throw new BadRequestException('Phone number is required');
      }

      // Normalize phone number (remove spaces, dashes, etc.)
      createServanteeDto.phone = this.normalizePhoneNumber(createServanteeDto.phone);

      const existing = await this.servanteeModel.findOne({ 
        phone: createServanteeDto.phone 
      }).exec();
      
      if (existing) {
        throw new DuplicatePhoneError(createServanteeDto.phone);
      }

      const created = new this.servanteeModel(createServanteeDto);
      return await created.save();
    } catch (err: any) {
      this.handleError(err, 'create servantee');
    }
  }

  async findAll(): Promise<Servantee[]> {
    return this.servanteeModel.find().exec();
  }

  async findOne(id: string): Promise<Servantee> {
    try {
      const servantee = await this.servanteeModel.findById(id).exec();
      if (!servantee) {
        throw new ServanteeNotFoundError(id);
      }
      return servantee;
    } catch (err: any) {
      this.handleError(err, `find servantee ${id}`);
    }
  }

 async update(id: string, updateServanteeDto: UpdateServanteeDto): Promise<Servantee> {
  try {
    // Check if servantee exists first
    const servantee = await this.servanteeModel.findById(id).exec();
    if (!servantee) {
      throw new ServanteeNotFoundError(id);
    }

    // Normalize and validate phone if provided
    if (updateServanteeDto.phone) {
      updateServanteeDto.phone = this.normalizePhoneNumber(updateServanteeDto.phone);

      // Check for duplicate phone number among other servantees
      const existing = await this.servanteeModel.findOne({
        phone: updateServanteeDto.phone,
        _id: { $ne: id },
      }).exec();

      if (existing) {
        throw new DuplicatePhoneError(updateServanteeDto.phone);
      }
    }

    // Proceed with update
    const updated = await this.servanteeModel
      .findByIdAndUpdate(id, updateServanteeDto, { new: true })
      .exec();

    // Just in case (rarely happens if doc deleted in between)
    if (!updated) {
      throw new ServanteeNotFoundError(id);
    }

    return updated;
  } catch (err: any) {
    this.handleError(err, `update servantee ${id}`);
  }
}


  async remove(id: string): Promise<Servantee> {
    try {
      const deleted = await this.servanteeModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new ServanteeNotFoundError(id);
      }
      return deleted;
    } catch (err: any) {
      this.handleError(err, `remove servantee ${id}`);
    }
  }

  private handleError(err: any, operation: string): never {
    if (err instanceof HttpException) {
      throw err;
    }

    if (err instanceof ServanteeError) {
      if (err instanceof ServanteeNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof DuplicatePhoneError) {
        throw new ConflictException(err.message);
      }
    }

    if (err?.code === 11000) {
      const dupField = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'duplicate key';
      throw new ConflictException(`${dupField} already exists`);
    }

    this.logger.error(`Failed to ${operation}`, err?.stack || err);
    throw new InternalServerErrorException(`Failed to ${operation}`);
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }
}
