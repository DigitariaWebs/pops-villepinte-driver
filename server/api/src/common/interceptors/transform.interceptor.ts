import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<{ data: T }> {
    // Skip SSE responses (text/event-stream)
    const response = ctx.switchToHttp().getResponse();
    const contentType = response.getHeader?.('content-type') ?? '';
    if (typeof contentType === 'string' && contentType.includes('text/event-stream')) {
      return next.handle() as unknown as Observable<{ data: T }>;
    }

    return next.handle().pipe(map((data) => ({ data })));
  }
}
