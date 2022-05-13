import * as yup from 'yup';

type IOption = { id: string; name: string };

export type IValueChainSchema = { name: string; product: IOption };

export const valueChainSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  product: yup.object().nullable().required('O produto é obrigatório'),
});
