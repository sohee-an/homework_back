import { BaseModel } from 'src/common/entity/baseModel.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RefreshToken extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  // @CreateDateColumn({name:'created_at'})
  // createdAt:Date;

  // @UpdateDateColumn({ name: 'updated_at' })
  // updatedAt:Date;

  @OneToOne(() => User, (user) => user.refreshToken)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
