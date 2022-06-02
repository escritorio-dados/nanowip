import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

import { IStatusDateFilter, statusDateFilterFields } from '@shared/utils/getStatusDate';

export class ReportProductQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsIn(statusDateFilterFields)
  @IsOptional()
  status_date?: IStatusDateFilter;

  @IsBoolean()
  @IsOptional()
  @Transform(v => v.value === 'true')
  includeAvailable?: boolean = true;

  @IsBoolean()
  @IsOptional()
  @Transform(v => v.value === 'true')
  includeFirst?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(v => v.value === 'true')
  includeLast?: boolean = false;

  // Outras entities
  @IsUUID()
  @IsOptional()
  project_id?: string;

  @IsUUID()
  @IsOptional()
  product_type_id?: string;
}
