import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindAllLimitedAssignmentsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsUUID()
  collaborator_id?: string;
}
