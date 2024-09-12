import { Controller, Get, Res } from '@nestjs/common';

import { Response } from 'express';
import { Public } from './common/decorator/public.decorator';

@Controller() // 기본적으로 루트 경로('/')에 매핑됩니다.
export class AppController {
  @Public()
  @Get() // GET 메소드로 루트 경로('/')에 응답합니다.
  getHello() {
    return 'hello, aws s3';
  }
}
