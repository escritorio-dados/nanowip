import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedSectionTrailsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
