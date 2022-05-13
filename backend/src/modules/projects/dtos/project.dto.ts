import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsOptional, IsDate, ValidateIf, IsArray } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class ProjectDto {
  @IsNotEmpty()
  name: string;

  @ValidateIf(data => !data.customer_id)
  @IsUUID()
  project_parent_id?: string;

  @ValidateIf(data => !data.project_parent_id)
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  portfolios_id?: string[];

  @IsUUID()
  project_type_id: string;

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
