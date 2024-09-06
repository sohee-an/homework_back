import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentGroupService } from './assignment-group.service';

describe('AssignmentGroupService', () => {
  let service: AssignmentGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentGroupService],
    }).compile();

    service = module.get<AssignmentGroupService>(AssignmentGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
