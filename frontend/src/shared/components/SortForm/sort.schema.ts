import * as yup from 'yup';

type IOption = { label: string; value: string };

export type ISortSchema = { sortBy: IOption; orderBy: IOption };

export const sortSchema = yup.object().shape({
  sortBy: yup.object().nullable().required('Campo obrigatório'),
  orderBy: yup.object().nullable().required('Campo obrigatório'),
});
