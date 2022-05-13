import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedProductTypesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
