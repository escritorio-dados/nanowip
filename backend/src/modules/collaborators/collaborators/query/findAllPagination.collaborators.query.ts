import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = ['name', 'id', 'updated_at', 'created_at', 'type', 'jobTitle'];

export class FindAllPaginationCollaboratorsQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'name';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'ASC';

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsIn(['Externo', 'Interno'])
  @IsOptional()
  type?: string;

  @IsNotEmpty()
  @IsOptional()
  jobTitle?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;
}
