import { IsNotEmpty, IsUUID } from 'class-validator';

export class InstantiateTrailDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  product_id: string;

  @IsUUID()
  trail_id: string;
}
