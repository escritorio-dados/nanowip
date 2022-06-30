import { IsUUID } from 'class-validator';

export class FindBySectionDeliverableQuery {
  @IsUUID()
  objective_section_id: string;
}
