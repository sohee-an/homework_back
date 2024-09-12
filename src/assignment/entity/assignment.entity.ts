import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { ImageModel } from './image.entity';
import { AssignmentGroupModel } from 'src/assignment-group/entity/assignment-group.entity';
import { BaseModel } from 'src/common/entity/baseModel.entity';

@Entity()
export class AssignmentModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.uploadedAssignments)
  @JoinColumn({ name: 'user_id' })
  upload: User;

  @ManyToOne(() => AssignmentGroupModel, (assignmentSet) => assignmentSet.assignments)
  @JoinColumn({ name: 'assignment_set_id' }) // 외래키 설정
  assignmentSet: AssignmentGroupModel;

  @OneToMany(() => ImageModel, (image) => image.assignment)
  images: ImageModel[];
}
