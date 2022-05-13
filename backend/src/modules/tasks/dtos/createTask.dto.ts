import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsOptional, IsDate, IsArray, IsUrl } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class CreateTaskDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsUUID()
  task_type_id: string;

  @IsUUID()
  value_chain_id: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  previous_tasks_ids?: string[] = [];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  next_tasks_ids?: string[] = [];

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
