import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';

export type ICreateObjectiveSectionRepository = {
  name: string;
  organization_id: string;
  position: number;
  objectiveCategory: ObjectiveCategory;
};
