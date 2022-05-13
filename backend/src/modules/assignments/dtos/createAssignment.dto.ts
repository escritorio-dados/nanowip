import { IsIn, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { StatusAssignment } from '../enums/status.assignment.enum';

export class CreateAssignmentDto {
  @IsUUID()
  collaborator_id: string;

  @IsUUID()
  task_id: string;

  @IsIn(Object.values(StatusAssignment))
  status: StatusAssignment;

  @IsPositive()
  @IsInt()
  @IsOptional()
  timeLimit?: number;
}
