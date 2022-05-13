import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

export type IFilterCostSchema = {
  reason: string;
  description: string;
  documentNumber: string;
  documentType: { id: string; name: string } | null;
  serviceProvider: { id: string; name: string } | null;
  status: { label: string; value: string } | null;
  min_value: string;
  max_value: string;
  min_due: Date | null;
  max_due: Date | null;
  min_issue: Date | null;
  max_issue: Date | null;
  min_payment: Date | null;
  max_payment: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const filterCostSchema = yup.object().shape({
  min_value: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  max_value: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
