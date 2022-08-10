import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';
import { ITagsGroup } from '#shared/types/ITags';

import { IDeliverable } from '#modules/objectives/deliverables/types/IDeliverable';
import { IDeliverableTag } from '#modules/objectives/deliverableTags/types/IDeliverableTag';
import { IObjectiveCategory } from '#modules/objectives/objectiveCategories/types/IObjectiveCategory';

export type IObjectiveSection = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  objectiveCategory: IObjectiveCategory;
  tagsGroup?: ITagsGroup;
  deliverables: IDeliverable[];
};

export type ICreateObjectiveSectionInput = {
  name: string;
  objective_category_id: string;
  tags?: string[];
};

export type IUpdateObjectiveSectionInput = { name: string; tags?: string[] };

export type INewPosition = { id: string; position: number };

export type ISortObjectiveSectionInput = {
  objective_category_id: string;
  newPositions: INewPosition[];
};

export type IObjectiveSectionTag = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  objectiveCategory: IObjectiveCategory;
  tagsGroup?: ITagsGroup;
  deliverablesTags: IDeliverableTag[];
};

export type IObjectiveSectionTagApi = {
  sections: IObjectiveSectionTag[];
  deliverablesStart: IDeliverableTag[];
  deliverablesEnd: IDeliverableTag[];
};
