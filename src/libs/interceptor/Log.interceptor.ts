import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const recordTime = Date.now();
    const requestType = context.getType();

    if (requestType === 'http') {
      const request = context.switchToHttp().getRequest();
      const { method, url, body } = request;

      // Request log
      this.logger.log(`${method} ${url}`, 'HTTP Request');
      if (body) {
        this.logger.log(`Body: ${JSON.stringify(body)}`, 'HTTP Request');
      }

      // Response log
      return next.handle().pipe(
        tap((data) => {
          const responseTime = Date.now() - recordTime;
          this.logger.log(
            `${method} ${url} - ${responseTime}ms`,
            'HTTP Response',
          );
        }),
      );
    }

    // WebSocket, RPC yoki boshqa protokollar uchun
    return next.handle();
  }

  private stringify(data: any): string {
    try {
      return JSON.stringify(data).slice(0, 77);
    } catch {
      return String(data).slice(0, 77);
    }
  }
}
