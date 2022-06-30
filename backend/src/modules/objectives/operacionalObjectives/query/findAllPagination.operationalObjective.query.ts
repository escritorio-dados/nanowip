import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = ['name', 'id', 'updated_at', 'created_at', 'deadline', 'integratedObjective'];

export class FindAllPaginationOperationalObjectivesQuery {
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

  @IsUUID()
  @IsOptional()
  integrated_objective_id?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_deadline?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_deadline?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;
}
