import { IsUUID } from 'class-validator';

export class FindByTaskAssignmentQuery {
  @IsUUID()
  task_id: string;
}
