import { FindManyOptions } from 'typeorm';
import { AssignmentModel } from '../entity/assignment.entity';

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<AssignmentModel> = {
  relations: {
    images: true,
    upload: true,
  },
};
