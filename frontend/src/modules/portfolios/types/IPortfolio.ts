import { ICommonApi } from '#shared/types/ICommonApi';

import { IProject } from '#modules/projects/projects/types/IProject';

export type IPortfolio = ICommonApi & {
  name: string;
  projects: IProject[];
};

export type IPortfolioFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IPortfolioInput = { name: string };

export const limitedPortfoliosLength = 100;
