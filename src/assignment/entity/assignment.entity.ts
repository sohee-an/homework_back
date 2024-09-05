import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { ImageModel } from './image.entity';

@Entity()
export class AssignmentModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column()
  // dayNumber: number;

  // @Column()
  // title: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.uploadedAssignments)
  @JoinColumn({ name: 'user_id' })
  upload: User;

  @OneToMany(() => ImageModel, (image) => image.assignment)
  images: ImageModel[];

  // @ManyToMany(() => User, (user) => user.assignments)
  // subscribe: User[];
}
