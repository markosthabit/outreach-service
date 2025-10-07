// auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Injectable()
@ApiBearerAuth()
export class JwtAuthGuard extends AuthGuard('jwt') {}
