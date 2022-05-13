import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

const pathOtions = ['product', 'project', 'customer'];

export class FindOneValueChainsQuery {
  @IsNotEmpty()
  @IsIn(pathOtions)
  @IsOptional()
  max_path?: 'product' | 'project' | 'customer' = 'customer';
}
