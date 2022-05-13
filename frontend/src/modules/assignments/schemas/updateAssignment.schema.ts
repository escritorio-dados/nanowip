import * as yup from 'yup';

import { validateDuration } from '#shared/utils/validateDuration';

export type IUpdateAssignmentSchema = { status: string; timeLimit?: string };

export const updateAssignmentSchema = yup.object().shape({
  status: yup.string().required('O status é obrigatório'),
  timeLimit: yup
    .string()
    .optional()
    .test({
      test: (value) => (value ? validateDuration(value) : true),
      message: 'Deve estar no formato hh:mm:ss',
    }),
});
