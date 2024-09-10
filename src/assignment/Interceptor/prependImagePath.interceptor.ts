import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PrependImagePathInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const S3_BASE_URL = 'https://homework-back-nestjs.s3.ap-northeast-2.amazonaws.com/';

        // 응답 데이터에 path가 있을 경우에만 수정
        if (data && data.path) {
          data.path = `${S3_BASE_URL}${data.path}`;
        }

        // 만약 응답이 배열일 경우 각각 처리
        if (Array.isArray(data)) {
          data = data.map((item) => {
            if (item.path) {
              item.path = `${S3_BASE_URL}${item.path}`;
            }
            return item;
          });
        }

        return data;
      }),
    );
  }
}
