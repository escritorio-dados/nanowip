import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindAllLimitedTaskTrailsQuery {
  @IsUUID()
  trail_id: string;

  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
