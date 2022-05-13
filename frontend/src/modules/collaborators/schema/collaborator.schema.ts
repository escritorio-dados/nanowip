import * as yup from 'yup';

type IOption = { id: string; email: string };

export type ICollaboratorSchema = {
  name: string;
  jobTitle: string;
  type: string | null;
  user?: IOption;
};

export const collaboratorSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  jobTitle: yup.string().required('O cargo é obrigatório'),
  type: yup.string().nullable().required('O tipo é obrigatório'),
});
