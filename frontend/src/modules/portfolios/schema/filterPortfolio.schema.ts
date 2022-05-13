import * as yup from 'yup';

export type IFilterPortfolioSchema = {
  name: string;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterPortfolioSchema = yup.object();
