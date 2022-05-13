import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

export type IFilterCollaboratorStatusSchema = {
  collaborator: { id: string; name: string } | null;
  min_salary: string;
  max_salary: string;
  min_month_hours: string;
  max_month_hours: string;
  min_date: Date | null;
  max_date: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCollaboratorStatusSchema = yup.object().shape({
  min_month_hours: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_month_hours: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  min_salary: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_salary: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
