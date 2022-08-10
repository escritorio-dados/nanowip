import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateObjectiveSectionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsArray()
  tags?: string[] = [];
}
