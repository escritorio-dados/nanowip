import { IsNotEmpty, IsUUID } from 'class-validator';

export class ValueChainDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  product_id: string;
}
