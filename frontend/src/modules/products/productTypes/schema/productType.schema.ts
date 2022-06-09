import * as yup from 'yup';

export type IProductTypeSchema = { name: string };

export const productTypeSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
