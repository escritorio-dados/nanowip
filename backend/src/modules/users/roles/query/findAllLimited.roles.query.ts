import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedRolesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
