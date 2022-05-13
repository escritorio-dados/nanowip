import * as yup from 'yup';

export type IServiceProviderSchema = { name: string };

export const serviceProviderSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
