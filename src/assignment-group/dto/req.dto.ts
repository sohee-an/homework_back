// create-assignment-group.dto.ts
import { IsString } from 'class-validator';

export class CreateAssignmentGroupDto {
  @IsString()
  name: string;
}

export class editAssignmentGroupDto {
  @IsString()
  name: string;
}