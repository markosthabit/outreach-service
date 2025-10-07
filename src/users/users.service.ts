import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, Logger, HttpException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DuplicateEmailError, UserNotFoundError, UserError, InvalidPasswordError } from './types/user-errors';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check for existing email
      const existing = await this.userModel.findOne({ 
        email: createUserDto.email.toLowerCase()
      }).exec();
      
      if (existing) {
        throw new DuplicateEmailError(createUserDto.email);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);
      
      const created = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword
      });
      
      return await created.save();
    } catch (err: any) {
      this.handleError(err, 'create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().select('-password').exec();
    } catch (err: any) {
      this.handleError(err, 'find all users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password').exec();
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    } catch (err: any) {
      this.handleError(err, `find user ${id}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.email) {
        // Check if email is already used by another user
        const existing = await this.userModel.findOne({
          email: updateUserDto.email.toLowerCase(),
          _id: { $ne: id }
        }).exec();
        
        if (existing) {
          throw new DuplicateEmailError(updateUserDto.email);
        }
        updateUserDto.email = updateUserDto.email.toLowerCase();
      }

      if (updateUserDto.password) {
        // Hash the new password
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          this.SALT_ROUNDS
        );
      }

      const updated = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
        .exec();

      if (!updated) {
        throw new UserNotFoundError(id);
      }

      return updated;
    } catch (err: any) {
      this.handleError(err, `update user ${id}`);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deleted = await this.userModel.findByIdAndDelete(id).select('-password').exec();
      if (!deleted) {
        throw new UserNotFoundError(id);
      }
      return deleted;
    } catch (err: any) {
      this.handleError(err, `remove user ${id}`);
    }
  }

  private handleError(err: any, operation: string): never {
    if (err instanceof HttpException) {
      throw err;
    }

    if (err instanceof UserError) {
      if (err instanceof UserNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof DuplicateEmailError) {
        throw new ConflictException(err.message);
      }
      if (err instanceof InvalidPasswordError) {
        throw new BadRequestException(err.message);
      }
    }

    if (err?.code === 11000) {
      const dupField = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'duplicate key';
      throw new ConflictException(`${dupField} already exists`);
    }

    this.logger.error(`Failed to ${operation}`, err?.stack || err);
    throw new InternalServerErrorException(`Failed to ${operation}`);
  }
}
