import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IBaseModal } from '#shared/types/IModal';

type IDeleteObjectiveSectionModal = IBaseModal & {
  objectiveSection: { id: string; name: string };
  updateList?: (id: string) => void;
  reloadList?: () => void;
};

export function DeleteObjectiveSectionModal({
  closeModal,
  objectiveSection,
  openModal,
  updateList,
  reloadList,
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

    if (reloadList) {
      reloadList();
    } else {
      updateList(objectiveSection.id);
    }

    toast({ message: 'seção excluida', severity: 'success' });

    closeModal();
  }, [objectiveSection, deleteObjectiveSection, reloadList, toast, closeModal, updateList]);

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
