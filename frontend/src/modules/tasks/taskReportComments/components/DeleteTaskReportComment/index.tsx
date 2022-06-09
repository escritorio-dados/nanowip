import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteTaskReportCommentModal = IDeleteModal & {
  taskReportComment: { id: string; comment: string };
};

export function DeleteTaskReportCommentModal({
  closeModal,
  taskReportComment,
  openModal,
  updateList,
}: IDeleteTaskReportCommentModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTaskReportComment } = useDelete(
    `/task_report_comments/${taskReportComment.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!taskReportComment) {
      return;
    }

    const { error } = await deleteTaskReportComment();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(taskReportComment.id);

    toast({ message: 'comentario deletado', severity: 'success' });

    closeModal();
  }, [taskReportComment, deleteTaskReportComment, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Comentario"
        maxWidth="sm"
      >
        <Typography>Tem Certeza que deseja deletar o comentario:</Typography>

        <TextConfirm>{taskReportComment.comment}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
