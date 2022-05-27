import { IsOptional, IsUUID } from 'class-validator';

export class RecalculateDatesValueChainDto {
  @IsUUID()
  @IsOptional()
  product_id?: string;
}
