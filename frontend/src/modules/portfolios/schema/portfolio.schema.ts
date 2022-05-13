import * as yup from 'yup';

export type IPortfolioSchema = { name: string };

export const portfolioSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
});
