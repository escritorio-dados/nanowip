import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sort_fields = ['name', 'id', 'updated_at', 'created_at'];

export class FindAllPaginationTaskTypesQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sort_fields)
  @IsOptional()
  sort_by?: string = 'name';

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
