import { ProjectType } from '../entities/ProjectType';

export const DEFAULT_PROJECT_TYPE_ID = 'f66b2b12-78a0-482b-bad4-fcf61a98c886';

const projectTypesSeeds: Partial<ProjectType>[] = [
  {
    id: DEFAULT_PROJECT_TYPE_ID,
    name: 'Projeto',
  },
];

export default projectTypesSeeds;
