import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

import { SectionTrail } from '../../sectionTrails/entities/SectionTrail';

export type ICreateTrailSectionRepository = {
  name: string;
  organization_id: string;
  position: number;
  sectionTrail: SectionTrail;
  tagsGroup?: TagsGroup;
};
