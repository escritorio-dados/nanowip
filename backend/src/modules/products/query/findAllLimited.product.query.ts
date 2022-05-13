import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedProductsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
