import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

import { IStatusDateFilter, statusDateFilterFields } from '@shared/utils/getStatusDate';
import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = [
  'id',
  'task',
  'collaborator',
  'start_date',
  'end_date',
  'deadline',
  'updated_at',
  'created_at',
];

export class FindPaginationAssignmentQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'task';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'ASC';

  @IsNotEmpty()
  @IsOptional()
  task?: string;

  @IsNotEmpty()
  @IsOptional()
  local?: string;

  @IsUUID()
  @IsOptional()
  collaborator_id?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(v => v.value === 'true')
  in_progress?: boolean;

  @IsIn(['Aberto', 'Fechado'])
  @IsOptional()
  status?: 'Aberto' | 'Fechado';

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
}
