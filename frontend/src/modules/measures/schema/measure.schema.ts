import * as yup from 'yup';

export type IMeasureSchema = { name: string };

export const measureSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
