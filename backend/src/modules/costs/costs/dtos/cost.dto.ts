import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsOptional, IsDate, IsPositive, IsUrl } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

export class CostDto {
  @IsNotEmpty()
  reason: string;

  @IsPositive()
  value: number;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsUrl()
  @IsOptional()
  documentLink?: string;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  issueDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  dueDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  paymentDate?: Date;

  @IsOptional()
  @IsNotEmpty()
  documentNumber?: string;

  @IsOptional()
  @IsUUID()
  document_type_id?: string;

  @IsOptional()
  @IsUUID()
  service_provider_id?: string;
}
