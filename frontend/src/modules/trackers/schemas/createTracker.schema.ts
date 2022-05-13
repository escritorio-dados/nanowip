import { isAfter } from 'date-fns';
import * as yup from 'yup';

import { IPathObject } from '#shared/types/backend/shared/ICommonApi';

export type ICreateTrackerSchema = {
  collaborator: { id: string; name: string };
  assignment: { id: string; path: IPathObject } | null;
  start: Date;
  end: Date;
  reason?: string;
};

export const createTrackerSchema = yup.object().shape({
  collaborator: yup.object().nullable().required('O colaborador é obrigatório'),
  reason: yup
    .string()
    .optional()
    .test({
      message: 'A atribuição ou o motivo devem ser preenchidos',
      test: (reason, context) => {
        if (!reason && !context.parent.assignment) {
          return false;
        }

        if (reason && context.parent.assignment) {
          return context.createError({
            path: 'reason',
            message: 'Só um deles deve ser preenchido (Atribuição e Motivo)',
          });
        }

        return true;
      },
    }),
  start: yup
    .date()
    .nullable()
    .test({
      message: 'O inicio não pode ser maior que a data atual',
      test: (start, context) => {
        if (!start) {
          return context.createError({
            message: 'O inicio é obrigatório',
            path: 'start',
          });
        }

        if (isAfter(start, new Date())) {
          return false;
        }

        return true;
      },
    }),
  end: yup
    .date()
    .nullable()
    .test({
      test: (end, context) => {
        if (!end) {
          return context.createError({
            message: 'O fim é obrigatório',
            path: 'end',
          });
        }

        if (!context.parent.start || isAfter(context.parent.start, end)) {
          return context.createError({
            message: 'O fim deve ser maior que o inicio',
            path: 'end',
          });
        }

        if (isAfter(end, new Date())) {
          return context.createError({
            message: 'O fim deve ser menor que a data atual',
            path: 'end',
          });
        }

        return true;
      },
    }),
});
