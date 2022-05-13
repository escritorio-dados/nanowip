import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedServicesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
