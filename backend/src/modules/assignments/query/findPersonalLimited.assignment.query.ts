import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindPersonalLimitedAssignmentsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
