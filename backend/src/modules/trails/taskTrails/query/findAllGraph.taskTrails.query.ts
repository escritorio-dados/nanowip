import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class FindAllGraphTaskTrailsQuery {
  @IsUUID()
  trail_id: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  node_width = 250;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  node_height = 150;
}
