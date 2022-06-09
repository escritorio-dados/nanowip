import { ICommonApi } from '#shared/types/backend/shared/ICommonApi';

import { ICost } from '#modules/costs/costs/types/ICost';

export type IDocumentType = ICommonApi & {
  name: string;
  costs: ICost[];
};

export type IDocumentTypeFilters = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type IDocumentTypeInput = { name: string };

export const limitedDocumentTypesLength = 100;
