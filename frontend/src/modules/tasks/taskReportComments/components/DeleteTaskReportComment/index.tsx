import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteTaskReportCommentModal = {
  openModal: boolean;
  closeModal: () => void;
  taskReportComment: { id: string; comment: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteTaskReportCommentModal({
  closeModal,
  taskReportComment,
  openModal,
  handleDeleteData,
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

    handleDeleteData(taskReportComment.id);

    toast({ message: 'comentario deletado', severity: 'success' });

    closeModal();
  }, [taskReportComment, deleteTaskReportComment, handleDeleteData, toast, closeModal]);

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

        <Typography
          component="strong"
          sx={{
            color: 'primary.main',
            marginTop: '1rem',
            display: 'block',
            width: '100%',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            whiteSpace: 'pre-wrap',
          }}
        >
          {taskReportComment.comment}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
