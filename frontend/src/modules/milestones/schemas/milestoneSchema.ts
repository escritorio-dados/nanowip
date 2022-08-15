import * as yup from 'yup';

export type IMilestoneSchema = {
  name: string;
  date: Date;
  description?: string;
};

export const milestoneSchema = yup.object().shape({
  name: yup.string().required('O nome é obrigatório'),
  date: yup.date().nullable().required('A data é obrigatória'),
});
