import * as yup from 'yup';

export type IStartTrackerSchema = { reason: string };

export const startTrackerSchema = yup.object().shape({
  reason: yup.string().required('O motivo é obrigatório'),
});
