import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { nextTick } from 'process';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;

    const now = new Date();
    console.log(`[REQ] ${path} ${now.toLocaleDateString('kr')}`);
    return next.handle().pipe(
      tap((observable) => console.log(observable)),
      map((observable) => {
        return {
          response: observable,
        };
      }),
    );
  }
}
