import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedCustomersQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
