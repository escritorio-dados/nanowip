import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

export type ICreateObjectiveSectionRepository = {
  name: string;
  organization_id: string;
  position: number;
  objectiveCategory: ObjectiveCategory;
  tagsGroup?: TagsGroup;
};
