import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';
import { TextConfirm } from '#shared/styledComponents/common';
import { IDeleteModal } from '#shared/types/IModal';

type IDeleteMeasureModal = IDeleteModal & { measure: { id: string; name: string } };

export function DeleteMeasureModal({
  closeModal,
  measure,
  openModal,
  updateList,
}: IDeleteMeasureModal) {
  const { toast } = useToast();

  const { loading: deleteLoading, send: deleteMeasure } = useDelete(`/measures/${measure.id}`);

  const handleDelete = useCallback(async () => {
    if (!measure) {
      return;
    }

    const { error } = await deleteMeasure();

    if (error) {
      toast({ message: error, severity: 'error' });

      return;
    }

    updateList(measure.id);

    toast({ message: 'unidade de medida excluida', severity: 'success' });

    closeModal();
  }, [measure, deleteMeasure, updateList, toast, closeModal]);

  return (
    <>
      <Loading loading={deleteLoading} />

      <CustomDialog
        open={openModal}
        closeModal={closeModal}
        title="Excluir Unidade de Medida"
        maxWidth="xs"
      >
        <Typography>Tem Certeza que deseja deletar a unidade de medida:</Typography>

        <TextConfirm>{measure.name}</TextConfirm>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
