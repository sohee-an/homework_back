import { PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AssignmentModel } from 'src/assignment/entity/assignment.entity';

export class CreatePostDto extends PickType(AssignmentModel, ['dayNumber', 'description', 'title']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images?: string[] = [];
}
