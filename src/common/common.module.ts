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

import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
      // storage: multer.diskStorage({
      //   destination: (req, file, cb) => {
      //     cb(null, TEMP_PATH);
      //   },
      //   filename: (req, file, cb) => {
      //     const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      //     const uniqueFileName = `${uuidv4()}${extname(fileName)}`;
      //     cb(null, uniqueFileName);
      //   },
      // }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|png|jpg|jpeg)$/)) {
          return cb(new Error('이미지 파일, pdf 파일이 아닙니다.'), false);
        }
        cb(null, true);
      },
    }),
  ],
  providers: [CommonService, AwsS3Service],
  controllers: [CommonController],
  exports: [CommonService],
})
export class CommonModule {}
