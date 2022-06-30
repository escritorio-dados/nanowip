import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteSectionTrailModal = IDeleteModal & { sectionTrail: { id: string; name: string } };

export function DeleteSectionTrailModal({
  closeModal,
  sectionTrail,
  openModal,
  updateList,
}: IDeleteSectionTrailModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteSectionTrail } = useDelete(
    `/section_trails/${sectionTrail.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!sectionTrail) {
      return;
    }

    const { error } = await deleteSectionTrail();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(sectionTrail.id);

    toast({ message: 'trilha excluida', severity: 'success' });

    closeModal();
  }, [sectionTrail, deleteSectionTrail, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog open={openModal} closeModal={closeModal} title="Excluir Trilha" maxWidth="xs">
        <Typography>Tem Certeza que deseja deletar a trilha:</Typography>

        <TextConfirm>{sectionTrail.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
