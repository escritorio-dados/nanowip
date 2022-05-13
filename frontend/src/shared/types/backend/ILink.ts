import { getSortOptions } from '#shared/utils/pagination';

import { ICommonApi } from './shared/ICommonApi';

export type ILink = ICommonApi & {
  title: string;
  url: string;
  active: boolean;
  description?: string;
  category?: string;
  owner?: string;
};

export type ILinkFilters = {
  title: string;
  description: string;
  category: string;
  owner: string;
  state: { label: string; value: string } | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

const linkStates = {
  active: 'Ativos',
  disabled: 'Desativados',
  all: 'Todos',
};

export const linkStatesOptions = getSortOptions(linkStates);

export type ILinkInput = {
  title: string;
  url: string;
  description?: string;
  category?: string;
  owner?: string;
};
