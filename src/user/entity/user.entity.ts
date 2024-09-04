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
import { AssignmentModel } from 'src/assignment/entity/assignment.entity';

@Entity()
export class User {
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToMany(() => AssignmentModel, (assignment) => assignment.upload)
  uploadedAssignments: AssignmentModel[];

  // @OneToMany(() => AssignmentModel, (assignment) => assignment.subscribe)
  // assignments: AssignmentModel[];
}
