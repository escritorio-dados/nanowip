import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

export type ICostDistributionSchema = {
  product: { id: string; pathString: string };
  taskType?: { id: string; name: string };
  percent: string;
};

export const costDistributionSchema = yup.object().shape({
  product: yup.object().nullable().required('O produto é obrigatório'),
  percent: yup
    .string()
    .test({
      test: (value) => (value ? validateNumbers(value) : true),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
