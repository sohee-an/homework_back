import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentModel } from './entity/assignment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { ImageModel, ImageModelType } from './entity/image.entity';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/req.dto';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';
import { ASSIGNMENT_PATH } from 'src/common/const/path.const';
import { join } from 'path';
import { promises } from 'fs';
import { CreatePostImageDto } from './image/dto/req.dto';
import { ImagesService } from './images.service';
import { AssignmentGroupModel } from 'src/assignment-group/entity/assignment-group.entity';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentModel) private assignmentRepository: Repository<AssignmentModel>,
    @InjectRepository(ImageModel) private readonly imageRepository: Repository<ImageModel>,
    @InjectRepository(AssignmentGroupModel)
    private readonly assignmentGroupRepository: Repository<AssignmentGroupModel>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly imagesService: ImagesService,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository<AssignmentModel>(AssignmentModel) : this.assignmentRepository;
  }

  async createAssignment(userId: string, body: CreatePostDto, assignmentGroupId: string, qr?: QueryRunner) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // assignmentGroupId로 AssignmentGroupModel 조회
    const assignmentGroup = await this.assignmentGroupRepository.findOne({ where: { id: assignmentGroupId } });
    if (!assignmentGroup) {
      throw new NotFoundException(`Assignment Group with ID ${assignmentGroupId} not found`);
    }

    const { description } = body;
    const repository = this.getRepository(qr);

    const post = repository.create({
      description,
      images: [],
      upload: user,
      assignmentSet: assignmentGroup, // assignmentGroup과 연결
    });

    return await repository.save(post);
  }

  async getAssignmentsByGroup(assignmentGroupId: string) {
    const assignments = await this.assignmentRepository.find({
      where: {
        assignmentSet: {
          id: assignmentGroupId,
        },
      },
      ...DEFAULT_POST_FIND_OPTIONS,
    });

    return assignments;
  }

  async getAssignmentById(assignmentId: string, qr?: QueryRunner) {
    const respository = this.getRepository(qr);

    const assignment = await respository.findOne({
      where: { id: assignmentId },
      ...DEFAULT_POST_FIND_OPTIONS, // 필요에 따라 연관된 엔티티를 함께 로드
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    return assignment;
  }

  // async updateAssignment(assignmentId: string, userId: string, body: CreatePostDto, qr?: QueryRunner) {
  //   const repository = this.getRepository(qr);
  //   const assignment = await this.assignmentRepository.findOne({
  //     where: { id: assignmentId },
  //     relations: ['upload', 'images', 'assignmentSet'],
  //   });

  //   if (!assignment) {
  //     throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
  //   }

  //   if (assignment.upload.id !== userId) {
  //     throw new BadRequestException('글쓴이와 수정하는 사람이 일치하지 않습니다.');
  //   }

  //   // 1. description 먼저 업데이트
  //   assignment.description = body.description;
  //   await repository.save(assignment); // description만 먼저 저장

  //   // 2. 기존 이미지 ID 배열 (이미 데이터베이스에 저장된 이미지들)
  //   const existingImagePaths = assignment.images.map((image) => image.path);

  //   // 3. 요청으로 받은 이미지 ID 배열 (body.images: [{ fileName, fileOriginName }] 형태)
  //   const receivedImagePaths = body.images.map((image) => image.fileName);

  //   // 4. 삭제해야 할 이미지 (기존에 있는데, 요청에 포함되지 않은 이미지)
  //   const imagesToDelete = assignment.images.filter((image) => !receivedImagePaths.includes(image.path));

  //   // 5. 삭제할 이미지 처리
  //   for (const image of imagesToDelete) {
  //     const filePath = join(ASSIGNMENT_PATH, image.path);
  //     try {
  //       await promises.unlink(filePath); // 파일 시스템에서 삭제
  //     } catch (e) {
  //       console.error(`Failed to delete file: ${filePath}`, e);
  //     }
  //     await this.imageRepository.remove(image); // 데이터베이스에서 삭제
  //   }

  //   // 6. 추가할 이미지 처리 (body.images에 있고 기존에는 없던 이미지)
  //   const newImages = body.images.filter((image) => !existingImagePaths.includes(image.fileName));

  //   for (let i = 0; i < newImages.length; i++) {
  //     const image = newImages[i];
  //     await this.imagesService.createPostImges({
  //       assignment,
  //       order: i,
  //       originName: image.fileOriginName,
  //       path: image.fileName,
  //       type: ImageModelType.ASSIGNMENT_IMAGE,
  //     });
  //   }
  // }
  async updateAssignment(assignmentId: string, userId: string, body: CreatePostDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['upload', 'images', 'assignmentSet'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    if (assignment.upload.id !== userId) {
      throw new BadRequestException('글쓴이와 수정하는 사람이 일치하지 않습니다.');
    }

    // 1. description 먼저 업데이트
    assignment.description = body.description;
    await repository.save(assignment); // description만 먼저 저장

    // 2. 기존 이미지 ID 배열 (이미 데이터베이스에 저장된 이미지들)
    const existingImagePaths = assignment.images.map((image) => image.path);

    // 3. 요청으로 받은 이미지 ID 배열 (body.images: [{ fileName, fileOriginName }] 형태)
    const receivedImagePaths = body.images.map((image) => image.fileName);

    // 4. 삭제해야 할 이미지 (기존에 있는데, 요청에 포함되지 않은 이미지)
    const imagesToDelete = assignment.images.filter((image) => !receivedImagePaths.includes(image.path));

    // 5. 삭제할 이미지 처리
    for (const image of imagesToDelete) {
      try {
        // S3에서 이미지 삭제
        await this.awsS3Service.deleteS3Object(image.path);
      } catch (e) {
        console.error(`Failed to delete S3 file: ${image.path}`, e);
      }
      await this.imageRepository.remove(image); // 데이터베이스에서 삭제
    }

    // 6. 추가할 이미지 처리 (body.images에 있고 기존에는 없던 이미지)
    const newImages = body.images.filter((image) => !existingImagePaths.includes(image.fileName));

    console.log('new', newImages);
    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];

      // S3에서 temp 폴더에서 images 폴더로 파일 이동
      const tempFileKey = `${image.fileName}`;

      const movedFile = await this.awsS3Service.moveFileInS3(tempFileKey);

      // 7. 이미지 정보 저장 (DB에 이동된 S3 경로로 저장)
      await this.imagesService.createPostImages({
        assignment,
        order: i,
        originName: image.fileOriginName,
        path: movedFile.newKey, // 이동된 images 폴더 경로로 저장
        type: ImageModelType.ASSIGNMENT_IMAGE,
      });
    }
  }

  async deleteAssignment(assignmentId: string, userId: string): Promise<{ message: string }> {
    // 과제 조회
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['upload', 'images'],
    });

    // 과제가 없으면 에러 발생
    if (!assignment) {
      throw new NotFoundException(` ${assignmentId}에 해당하는 Id를 찾을수가 었습니다.`);
    }

    // 등록자와 삭제하려는 자가 같은지 확인
    if (assignment.upload.id !== userId) {
      throw new BadRequestException('삭제할 권한이 없습니다.');
    }

    // S3에 저장된 이미지 삭제
    for (const image of assignment.images) {
      try {
        await this.awsS3Service.deleteS3Object(image.path);
      } catch (error) {
        console.error(`Failed to delete image from S3: ${image.path}`);
      }
      await this.imageRepository.remove(image);
    }

    // 과제 삭제
    await this.assignmentRepository.remove(assignment);

    return { message: '성공적으로 삭제되었습니다.' };
  }
}
