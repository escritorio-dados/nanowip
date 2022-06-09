import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IReloadModal } from '#shared/types/IModal';

type IDeleteProjectModal = IReloadModal & { project: { id: string; name: string } };

export function DeleteProjectModal({
  closeModal,
  project,
  openModal,
  reloadList,
}: IDeleteProjectModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteProject } = useDelete(`/projects/${project.id}`);

  const handleDelete = useCallback(async () => {
    if (!project) {
      return;
    }

    const { error } = await deleteProject();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    reloadList();

    toast({ message: 'projeto excluido', severity: 'success' });

    closeModal();
  }, [project, deleteProject, reloadList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Projeto" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar o projeto:</Typography>

        <TextConfirm>{project.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
