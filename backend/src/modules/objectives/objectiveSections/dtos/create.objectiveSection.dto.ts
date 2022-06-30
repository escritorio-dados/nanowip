import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateObjectiveSectionDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  objective_category_id: string;
}
