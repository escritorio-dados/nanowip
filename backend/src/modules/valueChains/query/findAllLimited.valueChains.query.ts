import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindAllLimitedValueChainsQuery {
  @IsUUID()
  value_chain_id: string;

  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
