import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with the specified role (Admin or Servant)'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - Please check password requirements and email format'
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<RegisterResponseDto> {
    const user = await this.authService.register(createUserDto);
    return {
      id: user['_id'].toString(),
      email: user.email,
      role: user.role
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT token'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: TokenResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input format'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    const result = await this.authService.login(loginDto);
    return {
      access_token: result.access_token,
      role: result.role,
    };
  }
}
