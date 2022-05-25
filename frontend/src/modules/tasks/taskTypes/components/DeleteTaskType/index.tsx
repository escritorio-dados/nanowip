import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteTaskTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  taskType: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteTaskTypeModal({
  closeModal,
  taskType,
  openModal,
  handleDeleteData,
}: IDeleteTaskTypeModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTaskType } = useDelete(`/task_types/${taskType.id}`);

  const handleDelete = useCallback(async () => {
    if (!taskType) {
      return;
    }

    const { error } = await deleteTaskType();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(taskType.id);

    toast({ message: 'tipo de tarefa excluida', severity: 'success' });

    closeModal();
  }, [taskType, deleteTaskType, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Tipo de Tarefa"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o tipo de tarefa:</Typography>

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
          }}
        >
          {taskType.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
