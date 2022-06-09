import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteProjectTypeModal = IDeleteModal & { projectType: { id: string; name: string } };

export function DeleteProjectTypeModal({
  closeModal,
  projectType,
  openModal,
  updateList,
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

    updateList(projectType.id);

    toast({ message: 'tipo de projeto excluido', severity: 'success' });

    closeModal();
  }, [projectType, deleteProjectType, updateList, toast, closeModal]);

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

        <TextConfirm>{projectType.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
