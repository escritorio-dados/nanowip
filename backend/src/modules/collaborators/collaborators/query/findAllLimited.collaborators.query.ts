import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedCollaboratorsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
