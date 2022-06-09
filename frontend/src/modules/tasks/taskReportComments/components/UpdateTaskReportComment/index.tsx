import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { FormTextField } from '#shared/components/form/FormTextField';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useGet, usePut } from '#shared/services/useAxios';
import { IUpdateModal } from '#shared/types/IModal';

import {
  ITaskReportComment,
  IUpdateTaskReportCommentInput,
} from '#modules/tasks/taskReportComments/types/ITaskReportComment';

import {
  ITaskReportCommentSchema,
  taskReportCommentSchema,
} from '../../schemas/taskReportComment.schema';

type IUpdateTaskReportCommentModal = IUpdateModal<ITaskReportComment> & { comment_id: string };

export function UpdateTaskReportCommentModal({
  closeModal,
  comment_id,
  openModal,
  updateList,
}: IUpdateTaskReportCommentModal) {
  const { toast } = useToast();

  const { send: updateTaskReportComment, loading: updateLoading } = usePut<
    ITaskReportComment,
    IUpdateTaskReportCommentInput
  >(`/task_report_comments/${comment_id}`);

  const {
    loading: taskReportCommentLoading,
    data: taskReportCommentData,
    error: taskReportCommentError,
  } = useGet<ITaskReportComment>({ url: `/task_report_comments/${comment_id}` });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITaskReportCommentSchema>({
    resolver: yupResolver(taskReportCommentSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    if (taskReportCommentError) {
      toast({ message: taskReportCommentError, severity: 'error' });

      closeModal();
    }
  }, [closeModal, taskReportCommentError, toast]);

  const onSubmit = useCallback(
    async ({ comment }: ITaskReportCommentSchema) => {
      const { error: updateErrors, data } = await updateTaskReportComment({ comment });

      if (updateErrors) {
        toast({ message: updateErrors, severity: 'error' });

        return;
      }

      updateList(comment_id, data as ITaskReportComment);

      toast({ message: 'comentario atualizado', severity: 'success' });

      closeModal();
    },
    [updateTaskReportComment, updateList, comment_id, toast, closeModal],
  );

  if (taskReportCommentLoading) return <Loading loading={taskReportCommentLoading} />;

  return (
    <>
      <Loading loading={updateLoading} />

      {taskReportCommentData && (
        <CustomDialog
          open={openModal}
          closeModal={closeModal}
          title="Editar comentario"
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
              defaultValue={taskReportCommentData.comment}
            />

            <CustomButton type="submit">Salvar Alterações</CustomButton>
          </form>
        </CustomDialog>
      )}
    </>
  );
}
