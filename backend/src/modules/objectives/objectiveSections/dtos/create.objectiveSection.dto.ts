import { IsArray, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateObjectiveSectionDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  objective_category_id: string;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsArray()
  tags?: string[] = [];
}
