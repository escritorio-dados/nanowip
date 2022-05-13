import * as yup from 'yup';

import { validateNumbers } from '#shared/utils/validateNumbers';

type IOption = { id: string; name: string };

export type ICollaboratorStatusSchema = {
  date: Date;
  monthHours: string;
  salary: string;
  collaborator: IOption;
};

export const collaboratorStatusSchema = yup.object().shape({
  date: yup.date().nullable().required('A data é obrigatória'),
  collaborator: yup.object().nullable().required('O colaborador é obrigatório'),
  monthHours: yup
    .string()
    .required('As horas trabalhadas no mês é obrigatória')
    .test({
      test: (value) => (value ? validateNumbers(value) : false),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
  salary: yup
    .string()
    .required('O salario é obrigatório')
    .test({
      test: (value) => (value ? validateNumbers(value) : false),
      message: 'Deve ser um numero',
    })
    .transform((value) => value.replace(',', '.')),
});
