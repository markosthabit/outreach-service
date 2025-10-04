export class ServanteeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServanteeError';
  }
}

export class ServanteeNotFoundError extends ServanteeError {
  constructor(id: string) {
    super(`Servantee with id ${id} not found`);
    this.name = 'ServanteeNotFoundError';
  }
}

export class DuplicatePhoneError extends ServanteeError {
  constructor(phone: string) {
    super(`Servantee with phone ${phone} already exists`);
    this.name = 'DuplicatePhoneError';
  }
}