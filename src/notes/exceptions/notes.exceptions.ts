import { HttpException, HttpStatus } from '@nestjs/common';

export class NoteException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

export class NoteNotFoundException extends NoteException {
  constructor(noteId: string) {
    super(`Note with ID ${noteId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidNoteIdException extends NoteException {
  constructor() {
    super('Invalid note ID format', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidEntityIdException extends NoteException {
  constructor(entityType: string) {
    super(`Invalid ${entityType} ID format`, HttpStatus.BAD_REQUEST);
  }
}

export class EntityNotFoundException extends NoteException {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} with ID ${entityId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class NoteOperationFailedException extends NoteException {
  constructor(operation: string, error: string) {
    super(
      `Failed to ${operation} note: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MissingEntityIdException extends NoteException {
  constructor() {
    super(
      'A note must be associated with either a servantee or a retreat.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
