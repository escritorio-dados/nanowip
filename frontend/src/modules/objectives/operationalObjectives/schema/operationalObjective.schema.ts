import * as yup from 'yup';

export type IOperationalObjectiveSchema = {
  name: string;
  deadline?: Date;
  integratedObjective: { id: string; name: string };
};

export const operationalObjectiveSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  integratedObjective: yup.object().nullable().required('O objetivo integrado é obrigatório'),
});
