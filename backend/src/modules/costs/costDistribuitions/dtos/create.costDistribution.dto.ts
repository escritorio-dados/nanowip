import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateCostDistributionDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  cost_id: string;

  @IsOptional()
  @IsUUID()
  task_type_id?: string;

  @Min(0)
  @IsNumber()
  percent: number;
}
