import { IsArray, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTrailSectionDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  section_trail_id: string;

  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsArray()
  tags?: string[] = [];
}
