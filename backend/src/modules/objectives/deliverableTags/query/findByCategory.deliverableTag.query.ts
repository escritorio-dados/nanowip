import { IsUUID } from 'class-validator';

export class FindByCategoryDeliverableQuery {
  @IsUUID()
  objective_category_id: string;
}
