import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindAllByProductValueChainsQuery {
  @IsUUID()
  product_id: string;

  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
