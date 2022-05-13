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

import { transformDatesApi } from '@shared/utils/transformDatesApi';

const sortFields = [
  'id',
  'task',
  'reason',
  'collaborator',
  'start',
  'end',
  'updated_at',
  'created_at',
];

export class FindPaginationTrackerQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'collaborator';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'ASC';

  @IsNotEmpty()
  @IsOptional()
  task?: string;

  @IsNotEmpty()
  @IsOptional()
  local?: string;

  @IsNotEmpty()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  collaborator_id?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(v => v.value === 'true')
  in_progress?: boolean;

  @IsIn(['Vinculado', 'Solto'])
  @IsOptional()
  type?: 'Vinculado' | 'Solto';

  @IsIn(['Aberto', 'Fechado'])
  @IsOptional()
  status?: 'Aberto' | 'Fechado';

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
