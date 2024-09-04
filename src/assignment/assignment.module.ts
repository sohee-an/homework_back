import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentModel } from './entity/assignment.entity';
import { ImageModel } from './entity/image.entity';
import { CommonModule } from 'src/common/common.module';
import { User } from 'src/user/entity/user.entity';
import { PostImagesService } from './images.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssignmentModel, ImageModel, User]), CommonModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, PostImagesService],
})
export class AssignmentModule {}
