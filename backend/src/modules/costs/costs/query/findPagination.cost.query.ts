import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { transformDatesApi } from '@shared/utils/transformDatesApi';

import { IStatusCostFilter, statusCostFilterFields } from '../utils/getStatusCost';

const sortFields = [
  'id',
  'reason',
  'description',
  'document_number',
  'document_type',
  'service_provider',
  'issue_date',
  'due_date',
  'payment_date',
  'updated_at',
  'created_at',
  'value',
];

export class FindPaginationCostQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'customer';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order_by?: 'ASC' | 'DESC' = 'ASC';

  @IsNotEmpty()
  @IsOptional()
  reason?: string;

  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsOptional()
  document_number?: string;

  @IsIn(statusCostFilterFields)
  @IsOptional()
  status?: IStatusCostFilter;

  // Valor
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  min_value?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  max_value?: number;

  // Data de Lançamento
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_issue?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_issue?: Date;

  // Datas de Vencimento
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_due?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_due?: Date;

  // Datas de pagamento
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_payment?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_payment?: Date;

  // Datas de update
  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  min_updated?: Date;

  @IsDate()
  @IsOptional()
  @Transform(transformDatesApi)
  max_updated?: Date;

  // Outras entities
  @IsUUID()
  @IsOptional()
  document_type_id?: string;

  @IsUUID()
  @IsOptional()
  service_provider_id?: string;
}
