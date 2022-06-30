import { IAllowedKeysCategories, ICommonApi } from '#shared/types/ICommonApi';

import { ISectionTrail } from '../../sectionTrails/types/ISectionTrail';

export type ITrailSection = ICommonApi<IAllowedKeysCategories> & {
  name: string;
  position: number;
  sectionTrail: ISectionTrail;
};

export type ICreateTrailSectionInput = { name: string; section_trail_id: string };

export type IUpdateTrailSectionInput = { name: string };

export type INewPosition = { id: string; position: number };

export type ISortTrailSectionInput = {
  section_trail_id: string;
  newPositions: INewPosition[];
};
