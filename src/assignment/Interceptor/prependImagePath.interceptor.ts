import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PrependS3UrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const S3_BASE_URL = 'https://homework-back-nestjs.s3.ap-northeast-2.amazonaws.com/';

    return next.handle().pipe(
      map((data) => {
        // data가 배열일 때
        if (Array.isArray(data)) {
          return data.map((item) => {
            if (item.images) {
              item.images = item.images.map((img) => ({
                ...img,
                path: `${S3_BASE_URL}${img.path}`,
              }));
            }
            return item;
          });
        }

        // data가 객체일 때
        if (data.images) {
          data.images = data.images.map((img) => ({
            ...img,
            path: `${S3_BASE_URL}${img.path}`,
          }));
        }

        return data;
      }),
    );
  }
}
