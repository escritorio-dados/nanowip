import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';

import { StatusAssignment } from '../enums/status.assignment.enum';

export class UpdateAssignmentDto {
  @IsIn(Object.values(StatusAssignment))
  status: StatusAssignment;

  @IsPositive()
  @IsInt()
  @IsOptional()
  timeLimit?: number;
}
