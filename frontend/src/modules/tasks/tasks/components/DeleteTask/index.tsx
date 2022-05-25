import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteTaskModal = {
  openModal: boolean;
  closeModal: () => void;
  task: { id: string; name: string };
  reloadList: () => void;
};

export function DeleteTaskModal({ closeModal, task, openModal, reloadList }: IDeleteTaskModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTask } = useDelete(`/tasks/${task.id}`);

  const handleDelete = useCallback(async () => {
    if (!task) {
      return;
    }

    const { error } = await deleteTask();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'tarefa excluido', severity: 'success' });

    closeModal();
  }, [task, deleteTask, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Tarefa" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a tarefa:</Typography>

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
          {task.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
