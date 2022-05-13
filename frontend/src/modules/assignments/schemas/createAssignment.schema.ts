import * as yup from 'yup';

import { validateDuration } from '#shared/utils/validateDuration';

export type ICreateAssignmentSchema = {
  status: string;
  collaborator: { id: string; name: string };
  timeLimit?: string;
};

export const createAssignmentSchema = yup.object().shape({
  collaborator: yup.object().nullable().required('O colaborador é obrigatório'),
  status: yup.string().required('O status é obrigatório'),
  timeLimit: yup
    .string()
    .optional()
    .test({
      test: (value) => (value ? validateDuration(value) : true),
      message: 'Deve estar no formato hh:mm:ss',
    }),
});
