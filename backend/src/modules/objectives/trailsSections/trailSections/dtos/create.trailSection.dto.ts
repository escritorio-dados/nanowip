import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTrailSectionDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  section_trail_id: string;
}
