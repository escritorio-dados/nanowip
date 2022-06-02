import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedMeasuresQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
