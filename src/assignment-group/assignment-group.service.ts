import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentGroupModel } from './entity/assignment-group.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { editAssignmentGroupDto } from './dto/req.dto';

@Injectable()
export class AssignmentGroupService {
  constructor(
    @InjectRepository(AssignmentGroupModel)
    private readonly assignmentGroupRepository: Repository<AssignmentGroupModel>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createAssignmentGroup(userId: string, name: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const post = this.assignmentGroupRepository.create({
      name,

      upload: user,
    });

    return await this.assignmentGroupRepository.save(post);
  }

  async getAllAssignmentGroups(): Promise<AssignmentGroupModel[]> {
    return await this.assignmentGroupRepository.find({
      relations: ['assignments', 'upload'], // 연관된 assignments도 함께 가져옴
    });
  }

  async deleteAssignmentGroup(assignmentGroupId: string): Promise<void> {
    const result = await this.assignmentGroupRepository.delete(assignmentGroupId);

    if (result.affected === 0) {
      throw new NotFoundException(`AssignmentGroup with ID ${assignmentGroupId} not found`);
    }
  }

  async putAssignmentGroup(assignmentGroupId: string, body: editAssignmentGroupDto): Promise<void> {
    const assignmentGroup = await this.findOneAssignmentGroup(assignmentGroupId);
    assignmentGroup.name = body.name || assignmentGroup.name;

    await this.assignmentGroupRepository.save(assignmentGroup);
  }

   async findOneAssignmentGroup(assignmentGroupId: string) {
    const findOneItem = await this.assignmentGroupRepository.findOne({
      where: { id: assignmentGroupId },
      relations: ['assignments', 'upload'],
    });

    if (!findOneItem) {
      throw new NotFoundException(`해당하는 id가 없습니다.`);
    }

    return findOneItem;
  }
}
