import * as yup from 'yup';

export type ITaskReportCommentSchema = { comment: string };

export const taskReportCommentSchema = yup.object().shape({
  comment: yup.string().required('O comentário é obrigatório'),
});
