import { Body, Controller, Delete, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { TEMP_PATH } from './const/path.const';
import { join } from 'path';
import { promises as fs } from 'fs';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  postImage(@UploadedFile() file: Express.Multer.File) {
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // UTF-8로 변환된 파일 이름
    const storedFileName = file.filename;
    return {
      originalName: originalFileName,
      fileName: storedFileName,
      fileSize: file.size,
    };
  }

  @Delete('image')
  async deleteImage(@Query('imageId') imageId: string) {
    console.log('imageId', imageId);

    const filePath = join(TEMP_PATH, imageId); // 파일 경로 생성

    try {
      await fs.unlink(filePath);
      return {
        imageId: imageId,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('파일업로드에 실패했습니다.');
    }
  }
}
