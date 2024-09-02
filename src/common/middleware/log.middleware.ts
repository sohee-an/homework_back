import { Inject, Injectable, Logger, LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl: url } = req;
    const userAgent = req.get('user-agent') || '';

    // 요청이 들어온 시점에 로깅
    this.logger.log(`[Request] ${method} ${url} - ${userAgent} ${ip}`);

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.logger.log(`[Response] ${method} ${url} ${statusCode} ${contentLength}- ${userAgent} ${ip}`);
    });
    next();
  }
}
