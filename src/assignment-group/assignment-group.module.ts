import { Module } from '@nestjs/common';
import { AssignmentGroupService } from './assignment-group.service';
import { AssignmentGroupController } from './assignment-group.controller';
import { AssignmentGroupModel } from './entity/assignment-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssignmentGroupModel, User])],
  controllers: [AssignmentGroupController],
  providers: [AssignmentGroupService],
})
export class AssignmentGroupModule {}
