import { IsNotEmpty } from 'class-validator';

export class MeasureDto {
  @IsNotEmpty()
  name: string;
}
