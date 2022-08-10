import * as yup from 'yup';

export type IUpdateObjectiveCategorySchema = {
  name: string;
  type: string;
  operationalObjective: { id: string; pathString: string };
};

export const updateObjectiveCategorySchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  type: yup.string().required('O tipo é obrigatório'),
  operationalObjective: yup.object().nullable().required('O objetivo integrado é obrigatório'),
});
