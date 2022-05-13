import { IsNotEmpty, IsOptional } from 'class-validator';

export class RecalculateDatesValueChainDto {
  @IsNotEmpty()
  @IsOptional()
  product_id?: string;
}
