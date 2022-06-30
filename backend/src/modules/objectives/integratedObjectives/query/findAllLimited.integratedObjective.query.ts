import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedIntegratedObjectivesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
