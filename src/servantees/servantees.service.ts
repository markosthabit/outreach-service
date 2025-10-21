import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, Logger, HttpException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async create(createServanteeDto: CreateServanteeDto, userId: string): Promise<Servantee> {
    try {
      if (!createServanteeDto.phone) {
        throw new BadRequestException('Phone number is required');
      }

      createServanteeDto.phone = this.normalizePhoneNumber(createServanteeDto.phone);

      const existing = await this.servanteeModel.findOne({ phone: createServanteeDto.phone }).exec();
      if (existing) {
        throw new DuplicatePhoneError(createServanteeDto.phone);
      }

      const created = new this.servanteeModel({
        ...createServanteeDto,
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
      });

      return await created.save();
    } catch (err: any) {
      this.handleError(err, 'create servantee');
    }
  }

async findAll({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search: string;
}): Promise<{
  data: Servantee[];
  total: number;
  page: number;
  pages: number;
}> {
  try {
    const filter: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { phone: regex },
        { church: regex },
        { education: regex },
        { work: regex },
      ];
    }

    const total = await this.servanteeModel.countDocuments(filter);
    const pages = Math.ceil(total / limit);
        const currentPage = Math.min(Math.max(1, page), pages);

    const skip = (page - 1) * limit;

    const data = await this.servanteeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'email role')
      .populate('updatedBy', 'email role')
      .exec();

    return {
      data,
      total,
      page: currentPage,
      pages,
    };
  } catch (err: any) {
    this.handleError(err, 'find all servantees');
  }
}


  async findOne(id: string): Promise<Servantee> {
    try {
      const servantee = await this.servanteeModel
        .findById(id)
        .populate('createdBy', 'email role')
        .populate('updatedBy', 'email role')
        .exec();

      if (!servantee) throw new ServanteeNotFoundError(id);
      return servantee;
    } catch (err: any) {
      this.handleError(err, `find servantee ${id}`);
    }
  }

  async update(id: string, updateServanteeDto: UpdateServanteeDto, userId: string): Promise<Servantee> {
    try {
      const servantee = await this.servanteeModel.findById(id).exec();
      if (!servantee) throw new ServanteeNotFoundError(id);

      if (updateServanteeDto.phone) {
        updateServanteeDto.phone = this.normalizePhoneNumber(updateServanteeDto.phone);

        const existing = await this.servanteeModel.findOne({
          phone: updateServanteeDto.phone,
          _id: { $ne: id },
        }).exec();

        if (existing) throw new DuplicatePhoneError(updateServanteeDto.phone);
      }

      const updated = await this.servanteeModel.findByIdAndUpdate(
        id,
        { ...updateServanteeDto, updatedBy: new Types.ObjectId(userId) },
        { new: true },
      ).exec();

      if (!updated) throw new ServanteeNotFoundError(id);

      return updated;
    } catch (err: any) {
      this.handleError(err, `update servantee ${id}`);
    }
  }

  async remove(id: string, userId: string): Promise<Servantee> {
    try {
      const deleted = await this.servanteeModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new ServanteeNotFoundError(id);

      this.logger.log(`User ${userId} deleted servantee ${id}`);
      return deleted;
    } catch (err: any) {
      this.handleError(err, `remove servantee ${id}`);
    }
  }

  private handleError(err: any, operation: string): never {
    if (err instanceof HttpException) throw err;

    if (err instanceof ServanteeError) {
      if (err instanceof ServanteeNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof DuplicatePhoneError) throw new ConflictException(err.message);
    }

    if (err?.code === 11000) {
      const dupField = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'duplicate key';
      throw new ConflictException(`${dupField} already exists`);
    }

    this.logger.error(`Failed to ${operation}`, err?.stack || err);
    throw new InternalServerErrorException(`Failed to ${operation}`);
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}
