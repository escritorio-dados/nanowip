import * as yup from 'yup';

export type IFilterProjectSchema = {
  name: string;
  customer: { id: string; name: string } | null;
  project_type: { id: string; name: string } | null;
  portfolio: { id: string; name: string } | null;
  status_date: { value: string; label: string } | null;

  min_start: Date | null;
  max_start: Date | null;

  min_end: Date | null;
  max_end: Date | null;

  min_available: Date | null;
  max_available: Date | null;

  min_deadline: Date | null;
  max_deadline: Date | null;

  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterProjectSchema = yup.object();
