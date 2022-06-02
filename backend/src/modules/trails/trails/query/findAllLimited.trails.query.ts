import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedTrailsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
