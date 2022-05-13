import { ICommonApi } from './shared/ICommonApi';

export const DEFAULT_ORGANIZATION_IDS = {
  SYSTEM: '3236e502-2718-4b80-8eda-a419fa56e482',
  UNASPRESS: '39f7c063-8670-429f-adf0-2fc3e0a258f1',
};

export type IOrganization = ICommonApi & {
  name: string;
};

export type IOrganizationFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IOrganizationInput = { name: string };

export type IPublicOrganization = {
  id: string;
  name: string;
};
