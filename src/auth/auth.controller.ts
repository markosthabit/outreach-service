import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the profile information of the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Token is valid but user is not authorized'
  })
  async getProfile(@Req() req): Promise<ProfileResponseDto> {
    return req.user;
  }
}
