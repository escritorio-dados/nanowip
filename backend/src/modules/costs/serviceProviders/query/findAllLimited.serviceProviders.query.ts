import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedServiceProvidersQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
