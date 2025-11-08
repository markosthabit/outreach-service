// auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email, true);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return { user: this.stripSensitive(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async getTokens(userId: string, email: string, role) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync({ sub: userId }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    return this.usersService.setRefreshTokenHash(userId, hash);
  }

  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneWithRefreshToken(userId);

    if (!user || !user.refreshTokenHash) return null;
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) return null;
    return user;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.getUserIfRefreshTokenMatches(userId, refreshToken);
    console.log("user: ", user);
    if (!user) throw new ForbiddenException('Invalid refresh token');
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken); // rotate
    return tokens;
  }

  async logout(userId: string) {
    return this.usersService.clearRefreshToken(userId);
  }

  private stripSensitive(user) {
    // remove password, refresh hash, etc
    const plain = user.toObject ? user.toObject() : user; // convert if possible
    const { password, refreshTokenHash, ...rest } = plain;
    return rest;
  }
}
