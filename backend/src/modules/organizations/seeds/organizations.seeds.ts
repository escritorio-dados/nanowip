import { Organization } from '../entities/Organization';

export const DEFAULT_ORGANIZATION_IDS = {
  SYSTEM: '3236e502-2718-4b80-8eda-a419fa56e482',
  UNASPRESS: '39f7c063-8670-429f-adf0-2fc3e0a258f1',
};

export const organizationsSeeds: Partial<Organization>[] = [
  {
    id: DEFAULT_ORGANIZATION_IDS.SYSTEM,
    name: 'Sistema',
  },
  {
    id: DEFAULT_ORGANIZATION_IDS.UNASPRESS,
    name: 'Unaspress',
  },
];
