import { PickType } from '@nestjs/swagger';
import { ImageModel } from 'src/assignment/entity/image.entity';

export class CreatePostImageDto extends PickType(ImageModel, ['path', 'order', 'type', 'assignment']) {}
