import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedTagsQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
