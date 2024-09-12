import { AssignmentModel } from 'src/assignment/entity/assignment.entity';
import { BaseModel } from 'src/common/entity/baseModel.entity';
import { User } from 'src/user/entity/user.entity';
import { Entity, OneToMany, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class AssignmentGroupModel extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.uploadedAssignments)
  @JoinColumn({ name: 'user_id' })
  upload: User;

  @OneToMany(() => AssignmentModel, (assignment) => assignment.assignmentSet, { cascade: true, eager: true })
  assignments: AssignmentModel[];
}
