import * as yup from 'yup';

export type IFilterValueChainSchema = {
  name: string;
  product: { id: string; pathString: string } | null;
  status_date: { value: string; label: string } | null;

  min_start: Date | null;
  max_start: Date | null;

  min_end: Date | null;
  max_end: Date | null;

  min_available: Date | null;
  max_available: Date | null;

  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterValueChainSchema = yup.object();
