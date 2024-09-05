import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AssignmentModel } from 'src/assignment/entity/assignment.entity';

class ImageDto {
  @IsString()
  fileName: string;

  @IsString()
  fileOriginName: string;
}
export class CreatePostDto extends PickType(AssignmentModel, ['description']) {
  // @IsString({
  //   each: true,
  // })
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @IsOptional()
  images?: ImageDto[] = [];
}
