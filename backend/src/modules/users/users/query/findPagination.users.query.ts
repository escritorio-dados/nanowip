import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

import { User } from '../entities/User';

const relationsFields = ['collaborator'];

const sortFields = ['name', 'id', 'email', 'updated_at', 'created_at'];

export class FindPaginationUsersQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: keyof User = 'updated_at';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'DESC';

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  permission?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  free?: boolean;

  @IsArray()
  @Type(() => String)
  @IsIn(Object.values(relationsFields), { each: true })
  @IsOptional()
  include?: string[];
}
