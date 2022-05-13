import { IsNotEmpty, IsOptional } from 'class-validator';

export class LinkDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsNotEmpty()
  owner?: string;
}
