import { IsNotEmpty } from 'class-validator';

export class PortfolioDto {
  @IsNotEmpty()
  name: string;
}
