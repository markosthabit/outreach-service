import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class UserExistsException extends HttpException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}

export class WeakPasswordException extends HttpException {
  constructor() {
    super(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidRoleException extends HttpException {
  constructor(role: string) {
    super(`Invalid role: ${role}. Role must be either 'Admin' or 'Servant'`, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`User not found with identifier: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}

export class TokenGenerationException extends HttpException {
  constructor() {
    super('Failed to generate authentication token', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}