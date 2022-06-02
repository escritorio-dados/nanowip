import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = ['id', 'name', 'updated_at', 'created_at'];

export class FindAllPaginationTrailsQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'updated_at';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'DESC';

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;
}
