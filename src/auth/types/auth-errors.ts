export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class TokenGenerationError extends AuthError {
  constructor() {
    super('Failed to generate authentication token');
    this.name = 'TokenGenerationError';
  }
}

export class UserRegistrationError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'UserRegistrationError';
  }
}