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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { Request, Response } from 'express';
import { Res } from '@nestjs/common';

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
  async login(@Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
): Promise<{ role: string }> {
    const result = await this.authService.login(loginDto.email, loginDto.password);
   // ✅ set cookies
  res.cookie('access_token', result.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  // Return minimal info in the body (avoid leaking tokens)
  return { role: result.user.role };
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


@Post('refresh')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Refresh access token using refresh cookie' })
@ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
@ApiResponse({ status: 403, description: 'Invalid refresh token' })
async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies?.['refresh_token'];
  if (!refreshToken) throw new ForbiddenException('No refresh token found');

  // decode token to get userId
  const payload = await this.authService['jwtService'].verifyAsync(refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET,
  });
  const userId = payload.sub;

  const tokens = await this.authService.refreshTokens(userId, refreshToken);


  // update cookies
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { message: 'Tokens refreshed' };
}
}
