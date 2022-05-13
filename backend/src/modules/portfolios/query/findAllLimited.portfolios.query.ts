import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedPortfoliosQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
