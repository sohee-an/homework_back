import { Body, Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { ASSIGNMENT_PATH, TEMP_PATH } from './const/path.const';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Response } from 'express';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService, private readonly awsS3Service: AwsS3Service) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFileToTemp(@UploadedFile() file: Express.Multer.File) {
    const folder = 'temp'; // temp 폴더 지정
    const result = await this.awsS3Service.uploadFileToS3(folder, file);

    // 파일의 원본 이름을 UTF-8로 변환
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const storedFileName = result.key;
    const fileSize = file.size;

    return {
      originName: originalFileName, // UTF-8로 변환된 원본 이름
      fileName: storedFileName, // S3에 저장된 파일의 Key
      fileSize: fileSize, // 파일 크기
      message: 'File uploaded to temp folder',
    };
  }

  @Delete('image')
  async deleteImage(@Query('imageId') imageId: string) {
    const filePath = `${imageId}`; // S3 temp 폴더 아래에서 imageId에 해당하는 파일 경로 설정

    console.log('ddd', filePath);
    try {
      // S3에서 파일 삭제
      await this.awsS3Service.deleteS3Object(filePath);
      return {
        imageId: imageId,
        message: 'File deleted successfully from S3',
      };
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('S3에서 파일 삭제에 실패했습니다.');
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
