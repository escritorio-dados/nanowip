import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteTrailSectionModal = IDeleteModal & {
  trailSection: { id: string; name: string };
};

export function DeleteTrailSectionModal({
  closeModal,
  trailSection,
  openModal,
  updateList,
}: IDeleteTrailSectionModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteTrailSection } = useDelete(
    `/trail_sections/${trailSection.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!trailSection) {
      return;
    }

    const { error } = await deleteTrailSection();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(trailSection.id);

    toast({ message: 'seção excluida', severity: 'success' });

    closeModal();
  }, [trailSection, deleteTrailSection, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Seção" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a seção:</Typography>

        <TextConfirm>{trailSection.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
