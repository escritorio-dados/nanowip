import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { usePost } from '#shared/services/useAxios';
import {
  ICreateTaskReportCommentInput,
  ITaskReportComment,
} from '#shared/types/backend/ITaskReportComment';

import {
  ITaskReportCommentSchema,
  taskReportCommentSchema,
} from '../../schemas/taskReportComment.schema';

type ICreateTaskReportCommentModal = {
  openModal: boolean;
  closeModal(): void;
  handleAdd(data: ITaskReportComment): void;
  task_id: string;
  reportName: string;
};

export function CreateTaskReportCommentModal({
  openModal,
  closeModal,
  handleAdd,
  task_id,
  reportName,
}: ICreateTaskReportCommentModal) {
  const { toast } = useToast();

  const { send: createTaskReportComment, loading: createLoading } = usePost<
    ITaskReportComment,
    ICreateTaskReportCommentInput
  >('task_report_comments');

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ITaskReportCommentSchema>({
    resolver: yupResolver(taskReportCommentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = useCallback(
    async ({ comment }: ITaskReportCommentSchema) => {
      const { error: createErrors, data } = await createTaskReportComment({
        comment,
        task_id,
        reportName,
      });

      if (createErrors) {
        toast({ message: createErrors, severity: 'error' });

        return;
      }

      handleAdd(data as any);

      toast({ message: 'comentario criado', severity: 'success' });

      closeModal();
    },
    [createTaskReportComment, task_id, reportName, handleAdd, toast, closeModal],
  );

  return (
    <>
      <Loading loading={createLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Cadastrar Comentario"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormTextField
            required
            multiline
            margin_type="no-margin"
            minRows={3}
            control={control}
            name="comment"
            label="Comentario"
            errors={errors.comment}
          />

          <CustomButton type="submit">Cadastrar Comentario</CustomButton>
        </form>
      </CustomDialog>
    </>
  );
}
