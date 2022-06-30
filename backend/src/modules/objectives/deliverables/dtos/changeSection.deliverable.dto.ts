import { IsNotEmpty } from 'class-validator';

export class ChangeSectionDeliverableDto {
  @IsNotEmpty()
  new_section_id: string;
}
