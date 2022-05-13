import { ICommonApi } from '../shared/ICommonApi';
import { ICost } from './ICost';

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
