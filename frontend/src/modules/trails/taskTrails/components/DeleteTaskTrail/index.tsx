import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

type IDeleteTaskTrailModal = IReloadModal & { task: { id: string; name: string } };

export function DeleteTaskTrailModal({
  closeModal,
  task,
  openModal,
  reloadList,
}: IDeleteTaskTrailModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTaskTrail } = useDelete(`/task_trails/${task.id}`);

  const handleDelete = useCallback(async () => {
    if (!task) {
      return;
    }

    const { error } = await deleteTaskTrail();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'tarefa excluida', severity: 'success' });

    closeModal();
  }, [task, deleteTaskTrail, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Tarefa" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a tarefa:</Typography>

        <TextConfirm>{task.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
