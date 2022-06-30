import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteObjectiveSectionModal = IDeleteModal & {
  objectiveSection: { id: string; name: string };
};

export function DeleteObjectiveSectionModal({
  closeModal,
  objectiveSection,
  openModal,
  updateList,
}: IDeleteObjectiveSectionModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteObjectiveSection } = useDelete(
    `/objective_sections/${objectiveSection.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!objectiveSection) {
      return;
    }

    const { error } = await deleteObjectiveSection();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(objectiveSection.id);

    toast({ message: 'seção excluida', severity: 'success' });

    closeModal();
  }, [objectiveSection, deleteObjectiveSection, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Seção" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a seção:</Typography>

        <TextConfirm>{objectiveSection.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
