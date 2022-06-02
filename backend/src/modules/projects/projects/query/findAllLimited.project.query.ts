import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedProjectsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
