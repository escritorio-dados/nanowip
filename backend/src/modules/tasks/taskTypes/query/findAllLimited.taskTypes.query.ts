import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedTaskTypesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
