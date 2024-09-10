import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ImageModel } from './entity/image.entity';
import { basename, join } from 'path';
import { CreatePostImageDto } from './image/dto/req.dto';
import { ASSIGNMENT_PATH, TEMP_PATH } from 'src/common/const/path.const';
import { promises } from 'fs';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository;
  }

  async createPostImages(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // S3에서 temp -> images로 파일 이동
    const movedFile = await this.awsS3Service.moveFileInS3(dto.path);

    // 이미지 정보 저장
    const result = await repository.save({
      ...dto,
      path: movedFile.newKey,
    });

    return result;
  }

  // async createPostImges(dto: CreatePostImageDto, qr?: QueryRunner) {
  //   const respository = this.getRepository(qr);
  //   const tempFilePath = join(TEMP_PATH, dto.path);

  //   try {
  //     await promises.access(tempFilePath);
  //   } catch (e) {
  //     throw new BadRequestException('존재하지 않는 파일입니다.');
  //   }

  //   const fileName = basename(tempFilePath);

  //   const newPath = join(ASSIGNMENT_PATH, fileName);

  //   const result = await respository.save({
  //     ...dto,
  //   });

  //   // 파일 옮기기
  //   await promises.rename(tempFilePath, newPath);
  //   return result;
  // }
}
