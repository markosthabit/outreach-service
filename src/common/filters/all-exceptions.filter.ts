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

    // ✅ Case 1: NestJS HttpExceptions (ConflictException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      // Special handling for validation errors
      if (exception instanceof BadRequestException && Array.isArray((res as any)?.message)) {
        return response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          error: 'Bad Request',
          validationErrors: (res as any).message,
        });
      }

      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(typeof res === 'object' ? res : { message: res }),
      });
    }

    // ✅ Case 2: Mongoose duplicate key error (MongoServerError code 11000)
    if (exception instanceof MongoServerError && exception.code === 11000) {
      const keyValue = exception.keyValue || {};
      const key = Object.keys(keyValue)
        .map((k) => `${k}: ${keyValue[k]}`)
        .join(', ');

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `${key} already exists`,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // ✅ Case 3: Unexpected errors (fallback → 500)
    console.error('Unexpected exception:', exception);
    
    // In production, avoid sending the actual error details
    const isProd = process.env.NODE_ENV === 'production';
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: isProd ? undefined : String(exception),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
