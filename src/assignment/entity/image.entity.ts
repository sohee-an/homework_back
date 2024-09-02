import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import { ASSIGNMENT_PATH } from 'src/common/const/path.const';
import { BaseModel } from 'src/common/entity/baseModel.entity';
import { Column, ManyToOne, Entity } from 'typeorm';
import { AssignmentModel } from './assignment.entity';

export enum ImageModelType {
  ASSIGNMENT_IMAGE,
  PROFILE_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  order: number;

  // @Column()
  // mimetype: string;

  @Column({
    type: 'enum',
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.ASSIGNMENT_IMAGE) {
      return join(ASSIGNMENT_PATH, value); // ASSIGNMENT_PATH와 경로를 결합
    } else if (obj.type === ImageModelType.PROFILE_IMAGE) {
      return value;
      // return join(PROFILE_PATH, value); // PROFILE_PATH와 경로를 결합
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne(() => AssignmentModel, (assignment) => assignment.images)
  assignment?: AssignmentModel;
}
