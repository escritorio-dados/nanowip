import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCostDistributionDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsUUID()
  service_id?: string;

  @Min(0)
  @IsNumber()
  percent: number;
}
