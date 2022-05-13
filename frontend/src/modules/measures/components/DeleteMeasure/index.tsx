import { Typography } from '@mui/material';
import { useCallback } from 'react';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomDialog } from '#shared/components/CustomDialog';
import { Loading } from '#shared/components/Loading';
import { useToast } from '#shared/hooks/toast';
import { useDelete } from '#shared/services/useAxios';

type IDeleteMeasureModal = {
  openModal: boolean;
  closeModal: () => void;
  measure: { id: string; name: string };
  handleDeleteData: (id: string) => void;
};

export function DeleteMeasureModal({
  closeModal,
  measure,
  openModal,
  handleDeleteData,
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

    handleDeleteData(measure.id);

    toast({ message: 'unidade de medida excluida', severity: 'success' });

    closeModal();
  }, [measure, deleteMeasure, handleDeleteData, toast, closeModal]);

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
          {measure.name}
        </Typography>

        <CustomButton color="error" onClick={handleDelete}>
          Sim
        </CustomButton>
      </CustomDialog>
    </>
  );
}
