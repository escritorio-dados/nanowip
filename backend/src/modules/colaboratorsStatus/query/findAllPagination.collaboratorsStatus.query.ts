import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sort_fields = [
  'id',
  'salary',
  'month_hours',
  'collaborator',
  'date',
  'updated_at',
  'created_at',
];

export class FindAllPaginationCollaboratorsStatusQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sort_fields)
  @IsOptional()
  sort_by?: string = 'date';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'DESC';

  @IsUUID()
  @IsOptional()
  collaborator_id?: string;

  // Salario
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  min_salary?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  max_salary?: number;

  // Horas Trabalhadas
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  min_month_hours?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  max_month_hours?: number;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_date?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_date?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;
}
