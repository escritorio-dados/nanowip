import * as yup from 'yup';

export type ICreateObjectiveCategorySchema = { name: string };

export const createObjectiveCategorySchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
