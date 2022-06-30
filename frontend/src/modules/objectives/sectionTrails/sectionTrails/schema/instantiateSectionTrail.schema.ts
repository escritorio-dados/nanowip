import * as yup from 'yup';

export type IInstantiateSectionTrailSchema = { sectionTrail: { id: string; name: string } };

export const instantiateSectionTrailSchema = yup.object().shape({
  sectionTrail: yup.object().nullable().required('A trilha é obrigatória'),
});
