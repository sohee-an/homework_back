import { Body, Controller, InternalServerErrorException, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreatePostDto } from './dto/req.dto';
import { User } from 'src/common/decorator/user.decorator';
import { ImageModelType } from './entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostImagesService } from './images.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decortor';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';

@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostImagesService,
  ) {}

  @Post()
  @UseInterceptors(TransactionInterceptor)
  @UseFilters(HttpExceptionFilter)
  async postAssignment(@User('id') userId: string, @Body() body: CreatePostDto, @QueryRunner() qr: QR) {
    const assignment = await this.assignmentService.createAssignment(userId, body);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImagesService.createPostImges({
        assignment,
        order: i,

        path: body.images[i],
        type: ImageModelType.ASSIGNMENT_IMAGE,
      });
      return this.assignmentService.getAssignmentById(assignment.id, qr);
    }
  }
}
