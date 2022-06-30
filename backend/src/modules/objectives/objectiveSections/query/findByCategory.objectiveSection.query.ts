import { IsUUID } from 'class-validator';

export class FindByCategoryObjectiveSectionQuery {
  @IsUUID()
  objective_category_id: string;
}
