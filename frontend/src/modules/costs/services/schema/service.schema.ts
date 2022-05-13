import * as yup from 'yup';

export type IServiceSchema = { name: string };

export const serviceSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
