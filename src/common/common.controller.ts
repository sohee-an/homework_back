import { Body, Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { ASSIGNMENT_PATH, TEMP_PATH } from './const/path.const';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Response } from 'express';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  postImage(@UploadedFile() file: Express.Multer.File) {
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8'); // UTF-8로 변환된 파일 이름
    const storedFileName = file.filename;
    return {
      originName: originalFileName,
      fileName: storedFileName,
      fileSize: file.size,
    };
  }

  @Delete('image')
  async deleteImage(@Query('imageId') imageId: string) {
    const filePath = join(TEMP_PATH, imageId);

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

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = join(ASSIGNMENT_PATH, fileName);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Could not download the file');
      }
    });
  }
}
