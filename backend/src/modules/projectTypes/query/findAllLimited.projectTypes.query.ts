import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedProjectTypesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
