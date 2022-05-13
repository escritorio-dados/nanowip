import * as yup from 'yup';

export type ICustomerSchema = { name: string };

export const customerSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
