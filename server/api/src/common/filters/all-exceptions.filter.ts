import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = {
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' },
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        body = { error: { code: this.codeFromStatus(status), message: res } };
      } else if (typeof res === 'object' && res !== null) {
        const r = res as { message?: string | string[]; error?: string };
        body = {
          error: {
            code: r.error ?? this.codeFromStatus(status),
            message: Array.isArray(r.message)
              ? r.message.join(', ')
              : r.message ?? exception.message,
            details: Array.isArray(r.message) ? r.message : undefined,
          },
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      body = { error: { code: 'INTERNAL_ERROR', message: exception.message } };
    }

    reply.status(status).send(body);
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 429:
        return 'RATE_LIMITED';
      default:
        return 'ERROR';
    }
  }
}
