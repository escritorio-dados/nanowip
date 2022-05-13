import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteProjectModal = {
  openModal: boolean;
  closeModal: () => void;
  project: { id: string; name: string };
  reloadList: () => void;
};

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
          {project.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
