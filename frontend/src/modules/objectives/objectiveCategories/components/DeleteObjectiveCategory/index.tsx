import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteObjectiveCategoryModal = IDeleteModal & {
  objectiveCategory: { id: string; name: string };
};

export function DeleteObjectiveCategoryModal({
  closeModal,
  objectiveCategory,
  openModal,
  updateList,
}: IDeleteObjectiveCategoryModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteObjectiveCategory } = useDelete(
    `/objective_categories/${objectiveCategory.id}`,
  );

  const handleDelete = useCallback(async () => {
    if (!objectiveCategory) {
      return;
    }

    const { error } = await deleteObjectiveCategory();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(objectiveCategory.id);

    toast({ message: 'categoria excluida', severity: 'success' });

    closeModal();
  }, [objectiveCategory, deleteObjectiveCategory, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Categoria"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a categoria:</Typography>

        <TextConfirm>{objectiveCategory.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
