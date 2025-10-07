export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserNotFoundError extends UserError {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class DuplicateEmailError extends UserError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'DuplicateEmailError';
  }
}

export class InvalidPasswordError extends UserError {
  constructor() {
    super('Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one special character');
    this.name = 'InvalidPasswordError';
  }
}