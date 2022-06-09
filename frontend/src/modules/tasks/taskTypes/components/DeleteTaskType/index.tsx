import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteTaskTypeModal = IDeleteModal & { taskType: { id: string; name: string } };

export function DeleteTaskTypeModal({
  closeModal,
  taskType,
  openModal,
  updateList,
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

    updateList(taskType.id);

    toast({ message: 'tipo de tarefa excluida', severity: 'success' });

    closeModal();
  }, [taskType, deleteTaskType, updateList, toast, closeModal]);

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

        <TextConfirm>{taskType.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
