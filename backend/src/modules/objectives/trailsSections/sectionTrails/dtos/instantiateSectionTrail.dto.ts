import { IsUUID } from 'class-validator';

export class InstantiateSectionTrailDto {
  @IsUUID()
  objective_category_id: string;

  @IsUUID()
  section_trail_id: string;
}
