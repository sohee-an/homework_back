import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { AssignmentGroupService } from './assignment-group.service';
import { CreateAssignmentGroupDto, editAssignmentGroupDto } from './dto/req.dto';
import { User } from 'src/common/decorator/user.decorator';

@ApiTags('AssignmentGroup') // Swagger에 보일 API 그룹 이름
@Controller('assignment-group')
export class AssignmentGroupController {
  constructor(private readonly assignmentGroupService: AssignmentGroupService) {}

  @ApiOperation({ summary: 'Create a new assignment group' })
  @ApiBody({ type: CreateAssignmentGroupDto })
  @Post()
  async createAssignmentGroup(@User('id') userId: string, @Body() createAssignmentGroup: CreateAssignmentGroupDto) {
    const { name } = createAssignmentGroup;
    return this.assignmentGroupService.createAssignmentGroup(userId, name);
  }

  @ApiOperation({ summary: '모든 assignmentGroup' })
  @Get()
  async getAssignmentGroup() {
    return this.assignmentGroupService.getAllAssignmentGroups();
  }

  @ApiOperation({ summary: 'assignmentGroup' })
  @ApiParam({ name: 'assignmentGroupId', type: String, description: 'Assignment Group ID' })
  @Get(':assignmentGroupId')
  async getOneAssignmentGroup(@Param('assignmentGroupId') assignmentGroupId: string) {
    return this.assignmentGroupService.findOneAssignmentGroup(assignmentGroupId);
  }

  @ApiOperation({ summary: ' assignmentGroup 삭제' })
  @ApiParam({ name: 'assignmentGroupId', type: String, description: 'Assignment Group ID' })
  @Delete(':assignmentGroupId')
  async deleteAssignmentGroup(@Param('assignmentGroupId') assignmentGroupId: string) {
    return this.assignmentGroupService.deleteAssignmentGroup(assignmentGroupId);
  }

  @ApiOperation({ summary: 'assignmentGroup 업데이트' })
  @ApiBody({ type: editAssignmentGroupDto })
  @ApiParam({ name: 'assignmentGroupId', type: String, description: 'Assignment Group ID' })
  @Put(':assignmentGroupId')
  async putAssignmentGroup(
    @Param('assignmentGroupId') assignmentGroupId: string,
    @Body() editAssignmentGroup: editAssignmentGroupDto,
  ) {
    return this.assignmentGroupService.putAssignmentGroup(assignmentGroupId, editAssignmentGroup);
  }
}
