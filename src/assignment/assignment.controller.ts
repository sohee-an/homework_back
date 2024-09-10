import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreatePostDto } from './dto/req.dto';
import { User } from 'src/common/decorator/user.decorator';
import { ImageModelType } from './entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { ImagesService } from './images.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decortor';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';
import { PrependS3UrlInterceptor } from './Interceptor/prependImagePath.interceptor';

@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly dataSource: DataSource,
    private readonly imagesService: ImagesService,
  ) {}

  @Get('group/:assignmentGroupId')
  @UseInterceptors(PrependS3UrlInterceptor)
  async getAssignmentsByGroup(@Param('assignmentGroupId') assignmentGroupId: string) {
    return await this.assignmentService.getAssignmentsByGroup(assignmentGroupId);
  }

  @Get(':assignmentId')
  async getDetailAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.getAssignmentById(assignmentId);
  }

  @Post(':assignmentGroupId')
  @UseInterceptors(TransactionInterceptor)
  @UseFilters(HttpExceptionFilter)
  async postAssignment(
    @User('id') userId: string,
    @Param('assignmentGroupId') assignmentGroupId: string,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ) {
    const assignment = await this.assignmentService.createAssignment(userId, body, assignmentGroupId);

    for (let i = 0; i < body.images.length; i++) {
      const image = body.images[i];

      // 3. 이동된 이미지 정보를 저장
      await this.imagesService.createPostImages({
        assignment,
        order: i,
        originName: image.fileOriginName,
        path: image.fileName,
        type: ImageModelType.ASSIGNMENT_IMAGE,
      });
    }
  }

  @Put(':assignmentId')
  async putAssignment(@User('id') userId: string, @Param('assignmentId') assignmentId: string, @Body() body: any) {
    
    const findAssignment = this.assignmentService.updateAssignment(assignmentId, userId, body);
    return findAssignment;
  }

  @Delete(':assignmentId')
  async deleteAssignment(@User('id') userId: string, @Param('assignmentId') assignmentId: string) {
    const findAssignment = this.assignmentService.deleteAssignment(assignmentId, userId);
    return findAssignment;
  }
}
