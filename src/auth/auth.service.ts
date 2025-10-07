import { Injectable, Logger, NotFoundException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/schemas/user.schema';
import { TokenResponseDto } from './dto/auth-response.dto';
import {
  InvalidCredentialsException,
  UserExistsException,
  WeakPasswordException,
  TokenGenerationException,
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * User self-registration (servants or admins, depending on who calls it).
   * Admins can also create users directly via UsersService.create().
   */
  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check password strength
      if (!this.isPasswordStrong(createUserDto.password)) {
        throw new WeakPasswordException();
      }

      // Ensure email not already registered
      let existingUser: User | null = null;
      try {
        existingUser = await this.usersService.findByEmail(createUserDto.email);
      } catch (err) {
        if (!(err instanceof NotFoundException)) throw err;
      }

      if (existingUser) {
        throw new UserExistsException(createUserDto.email);
      }

      // Let UsersService handle hashing and saving
      const user = await this.usersService.create({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
      });

      this.logger.log(`User registered successfully: ${user.email}`);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        `Failed to register user: ${error.message}`,
        error.stack,
      );

      if (error.name === 'ValidationError') throw error;
      if (error.code === 11000) {
        throw new UserExistsException(createUserDto.email);
      }

      throw error;
    }
  }

  /**
   * User login — validates credentials and returns JWT.
   */
  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    try {
      const user = await this.usersService.findByEmail(loginDto.email, true);
      if (!user) throw new InvalidCredentialsException();

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) throw new InvalidCredentialsException();

      const payload = { sub: user['_id'].toString(), email: user.email, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

      return { access_token: accessToken, role: user.role };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Failed to authenticate user: ${error.message}`, error.stack);
      throw error;
    }
  }

  private isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }
}
