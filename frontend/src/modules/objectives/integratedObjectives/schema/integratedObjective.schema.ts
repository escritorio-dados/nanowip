import * as yup from 'yup';

export type IIntegratedObjectiveSchema = { name: string };

export const integratedObjectiveSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
