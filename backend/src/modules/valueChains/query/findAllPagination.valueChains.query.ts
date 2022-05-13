import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sort_fields = [
  'name',
  'id',
  'updated_at',
  'created_at',
  'start_date',
  'end_date',
  'available_date',
  'product',
];

export class FindAllPaginationValueChainsQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sort_fields)
  @IsOptional()
  sort_by?: string = 'updated_at';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'DESC';

  @IsIn(['created', 'available', 'started', 'ended'])
  @IsOptional()
  status_date?: 'created' | 'available' | 'started' | 'ended';

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;

  // Datas de inicio
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_start?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_start?: Date;

  // Datas de término
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_end?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_end?: Date;

  // Datas de disponibilidade
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_available?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_available?: Date;
}
