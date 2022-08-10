import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTrailSectionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsArray()
  tags?: string[] = [];
}
