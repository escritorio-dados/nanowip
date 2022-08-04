import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

export type ICreateTagReporitory = {
  name: string;
  organization_id: string;
  tagsGroup: TagsGroup;
};
