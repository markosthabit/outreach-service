import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials during login
   */
  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByEmail(email, true);
      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return user;
    } catch (err: any) {
      this.logger.error(`Validation failed for ${email}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Generates a signed JWT token for an authenticated user
   */
  async login(user: User) {
    try {
      const payload = { sub: (user as any)._id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        access_token: token,
      };
    } catch (err: any) {
      this.logger.error(`Failed to login user ${user.email}: ${err.message}`);
      throw new InternalServerErrorException('Failed to generate token');
    }
  }

  /**
   * Registers a new user (Admin or Servant)
   */
  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = await this.usersService.create(createUserDto);
      this.logger.log(`User registered: ${newUser.email}`);
      return newUser;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      this.logger.error(`Failed to register user: ${err.message}`);
      throw err;
    }
  }
}
