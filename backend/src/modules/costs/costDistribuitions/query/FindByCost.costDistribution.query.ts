import { IsUUID } from 'class-validator';

export class FindByCostCostDistributionQuery {
  @IsUUID()
  cost_id?: string;
}
