import * as yup from 'yup';

export type IFilterLinkSchema = {
  title: string;
  description: string;
  category: string;
  owner: string;
  state: { label: string; value: string } | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterLinkSchema = yup.object();
