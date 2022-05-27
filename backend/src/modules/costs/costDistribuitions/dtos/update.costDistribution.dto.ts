import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCostDistributionDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  task_type_id?: string;

  @Min(0)
  @IsNumber()
  percent: number;
}
