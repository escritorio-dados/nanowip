import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { FindPaginationCostQuery } from './findPagination.cost.query';

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
  'product',
  'task_type',
  'percent_distributed',
  'updated_at',
  'created_at',
  'value',
];

export class FindPaginationDistributionCostQuery extends FindPaginationCostQuery {
  @IsIn(sortFields)
  @IsOptional()
  sort_by?: string = 'created_at';

  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsUUID()
  @IsOptional()
  task_type_id?: string;

  @IsOptional()
  @Type(() => Number)
  min_percent?: number;

  @IsOptional()
  @Type(() => Number)
  max_percent?: number;
}
