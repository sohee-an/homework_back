import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentGroupController } from './assignment-group.controller';
import { AssignmentGroupService } from './assignment-group.service';

describe('AssignmentGroupController', () => {
  let controller: AssignmentGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentGroupController],
      providers: [AssignmentGroupService],
    }).compile();

    controller = module.get<AssignmentGroupController>(AssignmentGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
