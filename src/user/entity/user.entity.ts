import { Video } from 'src/video/entity/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enum/user.enum';
import { RefreshToken } from 'src/auth/entity/refresh-token';
import { AssignmentGroupModel } from 'src/assignment-group/entity/assignment-group.entity';
import { BaseModel } from 'src/common/entity/baseModel.entity';

@Entity()
export class User extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Normal })
  role: UserRole;

  // @CreateDateColumn({ name: 'created_at' })
  // createdAt: Date;

  // @UpdateDateColumn({ name: 'updated_at' })
  // updatedAt: Date;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => AssignmentGroupModel, (assignment) => assignment.upload)
  uploadedAssignments: AssignmentGroupModel[];

  // @OneToMany(() => AssignmentModel, (assignment) => assignment.subscribe)
  // assignments: AssignmentModel[];
}
