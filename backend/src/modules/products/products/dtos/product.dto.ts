import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsOptional, IsDate, IsPositive, ValidateIf } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class ProductDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  product_type_id: string;

  @IsUUID()
  measure_id: string;

  @ValidateIf(data => !data.project_id)
  @IsUUID()
  product_parent_id?: string;

  @ValidateIf(data => !data.product_parent_id)
  @IsUUID()
  project_id?: string;

  @IsPositive()
  @IsOptional()
  quantity = 1;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  deadline?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  endDate?: Date | null;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  availableDate?: Date;
}
