import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentModel } from './entity/assignment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { promises } from 'fs';
import { ASSIGNMENT_PATH, TEMP_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import { CreatePostImageDto } from './image/dto/req.dto';
import { ImageModel } from './entity/image.entity';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/req.dto';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(AssignmentModel) private assignmentRepository: Repository<AssignmentModel>,
    @InjectRepository(ImageModel) private readonly imageRepository: Repository<ImageModel>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository<AssignmentModel>(AssignmentModel) : this.assignmentRepository;
  }

  async createAssignment(userId: string, body: CreatePostDto, qr?: QueryRunner) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { dayNumber, title, description } = body;
    const repository = this.getRepository(qr);
    // const assignment = new AssignmentModel();
    // assignment.dayNumber = body.dayNumber;
    // assignment.title = body.title;
    // assignment.description = body.description;
    // assignment.images = [];
    // assignment.upload = user;

    const post = repository.create({
      dayNumber,
      title,
      description,
      images: [],
      upload: user,
    });

    return await repository.save(post);
  }

  async getAssignmentById(postId: string, qr: QueryRunner) {
    const respository = this.getRepository(qr);

    const assignment = await respository.findOne({
      where: { id: postId },
      ...DEFAULT_POST_FIND_OPTIONS, // 필요에 따라 연관된 엔티티를 함께 로드
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${postId} not found`);
    }

    return assignment;
  }
}
