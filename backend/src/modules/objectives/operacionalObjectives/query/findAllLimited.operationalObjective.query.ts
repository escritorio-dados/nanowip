import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedOperationalObjectivesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
