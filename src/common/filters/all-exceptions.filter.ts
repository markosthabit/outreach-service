import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { MongoServerError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ✅ Case 1: Known HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      const message =
        typeof res === 'string'
          ? res
          : (res as any).message || 'Unexpected error';

      // Handle validation array
      if (
        exception instanceof BadRequestException &&
        Array.isArray((res as any)?.message)
      ) {
        return response.status(status).json({
          statusCode: status,
          error: 'Bad Request',
          message: 'Validation failed',
          validationErrors: (res as any).message,
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      }

      return response.status(status).json({
        statusCode: status,
        error: (res as any)?.error || exception.name,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // ✅ Case 2: Mongoose ValidationError
    if (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      (exception as any).name === 'ValidationError'
    ) {
      const validationErrors: Record<string, string> = {};
      for (const field in (exception as any).errors) {
        validationErrors[field] = (exception as any).errors[field].message;
      }

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Validation failed',
        validationErrors,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // ✅ Case 3: Mongo duplicate key error
    if (exception instanceof MongoServerError && exception.code === 11000) {
      const keyValue = exception.keyValue || {};
      const key = Object.keys(keyValue)
        .map((k) => `${k}: ${keyValue[k]}`)
        .join(', ');

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: `${key} already exists`,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // ✅ Case 4: Unknown errors (fallback)
    console.error('Unexpected exception:', exception);

    const isProd = process.env.NODE_ENV === 'production';
    const message =
      exception instanceof Error
        ? exception.message
        : 'Internal server error';

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: isProd ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
