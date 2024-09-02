import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import * as multer from 'multer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TEMP_PATH } from './const/path.const';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';

@Module({
  imports: [
    MulterModule.register({
      // limits: {
      //   fileSize: 1000000000,
      // },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, TEMP_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|png|jpg|jpeg)$/)) {
          return cb(new Error('이미지 파일, pdf 파일이 아닙니다.'), false);
        }
        cb(null, true);
      },
    }),
  ],
  providers: [CommonService],
  controllers: [CommonController],
  exports: [CommonService],
})
export class CommonModule {}
