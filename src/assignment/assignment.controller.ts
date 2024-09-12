import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
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

@ApiTags('Assignment') // Swagger에서 표시될 API 그룹 이름
@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly dataSource: DataSource,
    private readonly imagesService: ImagesService,
  ) {}

  @ApiOperation({ summary: 'assignments 가져오기' })
  @ApiParam({ name: 'assignmentGroupId', type: String, description: 'Assignment Group ID' })
  @Get('group/:assignmentGroupId')
  @UseInterceptors(PrependS3UrlInterceptor)
  async getAssignmentsByGroup(@Param('assignmentGroupId') assignmentGroupId: string) {
    return await this.assignmentService.getAssignmentsByGroup(assignmentGroupId);
  }

  @ApiOperation({ summary: 'assignments 삭제' })
  @ApiParam({ name: 'assignmentId', type: String, description: 'Assignment ID' })
  @Get(':assignmentId')
  async getDetailAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.getAssignmentById(assignmentId);
  }

  @ApiOperation({ summary: ' assignments 생성' })
  @ApiBody({ type: CreatePostDto })
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

    // 이미지 생성 및 저장
    for (let i = 0; i < body.images.length; i++) {
      const image = body.images[i];
      await this.imagesService.createPostImages({
        assignment,
        order: i,
        originName: image.fileOriginName,
        path: image.fileName,
        type: ImageModelType.ASSIGNMENT_IMAGE,
      });
    }

    return assignment;
  }

  @ApiOperation({ summary: 'assignments 수정' })
  @ApiParam({ name: 'assignmentId', type: String, description: 'Assignment ID' })
  @Put(':assignmentId')
  async putAssignment(@User('id') userId: string, @Param('assignmentId') assignmentId: string, @Body() body: any) {
    const findAssignment = this.assignmentService.updateAssignment(assignmentId, userId, body);
    return findAssignment;
  }

  @ApiOperation({ summary: ' assignments 삭제' })
  @ApiParam({ name: 'assignmentId', type: String, description: 'Assignment ID' })
  @Delete(':assignmentId')
  async deleteAssignment(@User('id') userId: string, @Param('assignmentId') assignmentId: string) {
    const findAssignment = this.assignmentService.deleteAssignment(assignmentId, userId);
    return findAssignment;
  }
}
