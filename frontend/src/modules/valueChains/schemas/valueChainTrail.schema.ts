import * as yup from 'yup';

type IOption = { id: string; name: string };

export type IValueChainTrailSchema = { name: string; product: IOption; trail: IOption };

export const valueChainTrailSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  product: yup.object().nullable().required('O produto é obrigatório'),
  trail: yup.object().nullable().required('A trilha é obrigatória'),
});
