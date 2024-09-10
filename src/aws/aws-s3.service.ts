import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { basename } from 'path';
import { PassThrough } from 'stream';
import { Response } from 'express';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  public readonly S3_BUCKET_NAME: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
    this.S3_BUCKET_NAME = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  // temp 폴더에 파일 업로드
  async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
  ): Promise<{
    key: string;
    s3Object: PutObjectCommandOutput;
    contentType: string;
  }> {
    try {
      const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const key = `${folder}/${Date.now()}_${basename(originalFileName)}`.replace(/ /g, '');
      // const extension = file.originalname.split('.').pop(); // 파일 확장자 추출
      // const key = `${folder}/${Date.now()}_${uuidv4()}.${extension}`.replace(/ /g, '');

      const command = new PutObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,

        ContentType: file.mimetype,
      });

      const s3Object = await this.s3Client.send(command);
      return { key, s3Object, contentType: file.mimetype };
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  // S3에서 파일 존재 여부 확인
  async checkFileExists(fileKey: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw new BadRequestException(`Failed to check file existence: ${error.message}`);
    }
  }
  async moveFileInS3(tempFileKey: string): Promise<{ newKey: string }> {
    // temp/로 시작하지 않으면 바로 리턴
    if (!tempFileKey.startsWith('temp/')) {
      console.log('File is already in images or not in temp, skipping move:', tempFileKey);
      return { newKey: tempFileKey }; // 이미 images/에 있는 파일일 경우, 이동을 스킵하고 해당 파일 경로를 반환
    }

    try {
      // 1. temp 폴더에 파일이 존재하는지 확인
      const fileExists = await this.checkFileExists(tempFileKey);

      if (!fileExists) {
        throw new BadRequestException(`${tempFileKey} 파일이 없습니다.`);
      }

      const newKey = tempFileKey.replace('temp/', 'images/');

      const encodedCopySource = encodeURIComponent(`${this.S3_BUCKET_NAME}/${tempFileKey}`);

      // 2. temp에서 images로 파일 복사
      const copyCommand = new CopyObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        CopySource: encodedCopySource,
        Key: newKey,
      });

      await this.s3Client.send(copyCommand);

      // 3. 원본 temp 파일 삭제
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: tempFileKey,
      });

      await this.s3Client.send(deleteCommand);

      return { newKey };
    } catch (error) {
      throw new BadRequestException(`Failed to move file: ${error.message}`);
    }
  }

  // S3 파일 삭제
  async deleteS3Object(key: string): Promise<{ success: true }> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async downloadFileFromS3(fileKey: string, res: Response): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: fileKey,
      });

      const data: GetObjectCommandOutput = await this.s3Client.send(command);

      if (!data.Body) {
        throw new BadRequestException('File not found in S3');
      }

      const passThrough = new PassThrough();
      (data.Body as any).pipe(passThrough);

      // header 설정
      const encodedFileName = encodeURIComponent(fileKey);
      res.set({
        'Content-Type': data.ContentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      });

      passThrough.pipe(res);
    } catch (error) {
      throw new BadRequestException(`Failed to download file: ${error.message}`);
    }
  }

  // S3 파일 URL 생성
  public getAwsS3FileUrl(objectKey: string): string {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
  }
}
