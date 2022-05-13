import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteProjectTypeModal = {
  openModal: boolean;
  closeModal: () => void;
  projectType: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteProjectTypeModal({
  closeModal,
  projectType,
  openModal,
  handleDeleteData,
}: IDeleteProjectTypeModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteProjectType } = useDelete(
    `/project_types/${projectType.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!projectType) {
      return;
    }

    const { error } = await deleteProjectType();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    handleDeleteData(projectType.id);

    toast({ message: 'tipo de projeto excluido', severity: 'success' });

    closeModal();
  }, [projectType, deleteProjectType, handleDeleteData, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Tipo de Projeto"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar o tipo de projeto:</Typography>

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
          {projectType.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
