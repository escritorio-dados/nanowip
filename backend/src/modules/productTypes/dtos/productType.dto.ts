import { IsNotEmpty } from 'class-validator';

export class ProductTypeDto {
  @IsNotEmpty()
  name: string;
}
