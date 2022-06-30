import { SectionTrail } from '../../sectionTrails/entities/SectionTrail';

export type ICreateTrailSectionRepository = {
  name: string;
  organization_id: string;
  position: number;
  sectionTrail: SectionTrail;
};
