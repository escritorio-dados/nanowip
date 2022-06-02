import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { IStatusDateFilter, statusDateFilterFields } from '@shared/utils/getStatusDate';
import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = [
  'id',
  'name',
  'deadline',
  'available_date',
  'start_date',
  'end_date',
  'updated_at',
  'created_at',
  'customer',
  'project_type',
  'portfolio',
];

export class FindPaginationProjectQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'customer';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'ASC';

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsIn(statusDateFilterFields)
  @IsOptional()
  status_date?: IStatusDateFilter;

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

  // Datas de prazo
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_deadline?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_deadline?: Date;

  // Datas de update
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsUUID()
  @IsOptional()
  project_type_id?: string;

  @IsUUID()
  @IsOptional()
  portfolio_id?: string;
}
