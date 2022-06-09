import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

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
