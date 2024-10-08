import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentModel } from './entity/assignment.entity';
import { ImageModel } from './entity/image.entity';
import { CommonModule } from 'src/common/common.module';
import { User } from 'src/user/entity/user.entity';
import { ImagesService } from './images.service';
import { AssignmentGroupModel } from 'src/assignment-group/entity/assignment-group.entity';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentModel, ImageModel, User, AssignmentGroupModel]),
    CommonModule,
    AwsModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService, ImagesService],
})
export class AssignmentModule {}
