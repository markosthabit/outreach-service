import { HttpException, HttpStatus } from '@nestjs/common';

export class RetreatNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Retreat with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidRetreatIdException extends HttpException {
  constructor(id: string) {
    super(`Invalid retreat ID format: ${id}`, HttpStatus.BAD_REQUEST);
  }
}

export class RetreatDatesInvalidException extends HttpException {
  constructor(message: string = 'Invalid retreat dates') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class RetreatAttendeeNotFoundException extends HttpException {
  constructor(attendeeId: string) {
    super(`Attendee with ID ${attendeeId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class RetreatOperationFailedException extends HttpException {
  constructor(operation: string, error: string) {
    super(
      `Failed to ${operation} retreat: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}