import { ICommonApi } from '#shared/types/ICommonApi';

import { ITrailSection } from '../../trailSections/types/ITrailSection';

export type ISectionTrail = ICommonApi & {
  name: string;
  sections: ITrailSection[];
};

export type ISectionTrailFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ISectionTrailInput = { name: string };

export type IInstantiateSectionTrailInput = {
  objective_category_id: string;
  section_trail_id: string;
};

export const limitedSectionTrailsLength = 100;
