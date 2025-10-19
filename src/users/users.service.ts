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

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
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

  async findOne(id: string): Promise<UserDocument> {
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

  async findOneWithRefreshToken(userId: string) {
  return this.userModel.findById(userId).select('+refreshTokenHash');
}

async findByEmail(email: string, includePassword = false): Promise<UserDocument> {
  try {
    let query = this.userModel.findOne({ email: email.toLowerCase() }) as any;
    // If password is needed, explicitly include it
    if (includePassword) {
      query = query.select('+password');
    } else {
      query = query.select('-password');
    }
    const user: UserDocument | null = await query.exec();

    if (!user) throw new UserNotFoundError(email);
    return user;
  } catch (err: any) {
    this.handleError(err, `find user by email ${email}`);
  }
}



  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
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

  async remove(id: string): Promise<UserDocument> {
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

async setRefreshTokenHash(userId: string, hash: string): Promise<void> {
  await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
}

async clearRefreshToken(userId: string) {
  return this.userModel.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } });
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
