import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Column, ManyToOne, Entity } from 'typeorm';
import { AssignmentModel } from './assignment.entity';
import { BaseModel } from 'src/common/entity/baseModel.entity';

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

  @Column({
    type: 'enum',
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    const S3_BASE_URL = 'https://homework-back-nestjs.s3.ap-northeast-2.amazonaws.com/'; // S3 버킷 URL

    if (obj.type === ImageModelType.ASSIGNMENT_IMAGE) {
      return `${S3_BASE_URL}${value}`; // S3 버킷 URL과 파일 경로를 결합
    } else if (obj.type === ImageModelType.PROFILE_IMAGE) {
      return `${S3_BASE_URL}${value}`; // 프로필 이미지도 S3 버킷 URL과 경로 결합
    } else {
      return value;
    }
  })
  path: string;

  @Column()
  @IsString()
  originName: string;

  @ManyToOne(() => AssignmentModel, (assignment) => assignment.images, { nullable: false })
  assignment: AssignmentModel;
}
