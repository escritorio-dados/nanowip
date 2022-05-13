import { IsIn } from 'class-validator';

import { StatusAssignment } from '../enums/status.assignment.enum';

export class ChangeStatusAssignmentDto {
  @IsIn(Object.values(StatusAssignment))
  status: StatusAssignment;
}
